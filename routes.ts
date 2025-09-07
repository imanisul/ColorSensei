import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, studentEnrollmentSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import { createHmac } from "crypto";
import Razorpay from "razorpay";

import { config } from "dotenv";

config();

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || "rzp_test_default";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "secret_default";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage?.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get courses by class
  app.get("/api/courses/class/:classLevel", async (req, res) => {
    try {
      const { classLevel } = req.params;
      const courses = await storage?.getCoursesByClass(classLevel);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses for class" });
    }
  });

  // Get single course
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req?.params;
      const course = await storage?.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Create enrollment and payment order
  app.post("/api/enroll", async (req, res) => {
    try {
      const validatedData = studentEnrollmentSchema.parse(req?.body);
      
      // Get course details
      const course = await storage?.getCourse(validatedData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Create student
      const student = await storage.createStudent({
        name: validatedData.name,
        class: validatedData.class,
        board: validatedData.board,
        parentName: validatedData.parentName,
        parentPhone: validatedData.parentPhone,
        email: validatedData.email,
      });

      // Create enrollment
      const enrollment = await storage?.createEnrollment({
        studentId: student.id,
        courseId: validatedData.courseId,
        amount: course.price,
        status: 'pending',
      });

      // Create Razorpay order using official API
      const orderAmount = course.price * 100; // Convert to paise
      
      console.log('Creating Razorpay order for amount:', orderAmount);
      
      const razorpayOrder = await razorpay.orders.create({
        amount: orderAmount,
        currency: 'INR',
        receipt: `enroll_${Date.now()}`,
        payment_capture: true,
      });

      console.log('Razorpay order created:', razorpayOrder);

      // Create payment record
      const payment = await storage.createPayment({
        enrollmentId: enrollment.id,
        razorpayOrderId: razorpayOrder.id,
        amount: course.price,
        currency: 'INR',
        status: 'pending',
      });

      const orderResponse = {
        orderId: razorpayOrder.id,
        amount: orderAmount,
        currency: 'INR',
        studentId: student.id,
        enrollmentId: enrollment.id,
        paymentId: payment.id,
        courseName: course.name,
      };

      console.log('Sending order response:', orderResponse);
      res.json(orderResponse);

    } catch (error) {
      console.error("Error fetching courses:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error('Enrollment error:', error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Verify payment
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

      if (!paymentId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({ message: "Missing required payment data" });
      }

      // Verify the payment signature
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
      
      const payment = await storage?.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Update payment status
      await storage.updatePaymentStatus(paymentId, 'completed', razorpayPaymentId);

      // Update enrollment status
      await storage.updateEnrollmentStatus(payment.enrollmentId, 'completed');

      res.json({ 
        message: "Payment verified successfully",
        status: 'completed'
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Get Razorpay key for frontend
  app.get("/api/razorpay-key", (req, res) => {
    res.json({ key: RAZORPAY_KEY_ID });
  });

  const httpServer = createServer(app);
  return httpServer;
}
