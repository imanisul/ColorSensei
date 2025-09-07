import { type Student, type InsertStudent, type Course, type InsertCourse, type Enrollment, type InsertEnrollment, type Payment, type InsertPayment, students, courses, enrollments, payments } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Students
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Courses
  getCourse(id: string): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getCoursesByClass(classLevel: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Enrollments
  getEnrollment(id: string): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentStatus(id: string, status: string): Promise<Enrollment | undefined>;
  
  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: string, status: string, razorpayPaymentId?: string): Promise<Payment | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize default courses asynchronously
    setTimeout(() => this.initializeDefaultCourses(), 1000);
  }

  private async initializeDefaultCourses() {
    try {
      // Check if courses already exist
      const existingCourses = await db.select().from(courses);
      if (existingCourses.length > 0) {
        return; // Courses already initialized
      }

      // Insert courses one by one to avoid type issues
      await db.insert(courses).values({
        name: "Aarambh Course",
        tagline: "Start your learning journey with us!",
        duration: "1 Week",
        mode: "Live Online Classes",
        price: 9,
        subjects: ["Math", "Science", "English", "Vedic Math", "Public Speaking"],
        features: [
          "6 Days Live Classes",
          "Interactive & Engaging Lessons", 
          "Small Batch Sizes for Personalized Attention",
          "Doubt Clearing Sessions During or After Class",
          "Fun Animated Videos & Learning Materials"
        ],
        benefits: [
          "Low-cost trial to experience HeyyGuru's teaching",
          "Interactive learning experience",
          "Build confidence in core subjects",
          "Personalized attention in small batches"
        ],
        type: "aarambh"
      });

      await db.insert(courses).values({
        name: "Atal Course",
        tagline: "Padhai ka Agla Kadam, Success ki Guarantee",
        duration: "1 Year (Academic Session)",
        mode: "Live Online Classes",
        price: 4250,
        subjects: ["Mathematics", "Science", "English", "Social Studies"],
        features: [
          "1–2 Weekly Mentor Doubt Sessions",
          "Monthly Tests",
          "High-Quality Content",
          "Flexible Learning"
        ],
        benefits: [
          "Strengthen core subjects",
          "Improve grades with regular assessments",
          "Interactive & engaging content",
          "Affordable yearly plan"
        ],
        type: "atal"
      });

      await db.insert(courses).values({
        name: "Atal Course (Premium Plus)",
        tagline: "Complete academic + skill development with personal guidance",
        duration: "1 Year",
        mode: "Live Online Classes",
        price: 9999,
        subjects: ["Mathematics", "Science", "English", "Social Studies", "Vedic Mathematics", "Public Speaking"],
        features: [
          "Daily 1-on-1 Mentor Sessions",
          "Bi-Weekly Minor Tests",
          "Monthly Major Tests",
          "Monthly PTMs",
          "Skill Development Sessions",
          "Counseling Sessions",
          "Competitive Exam Preparation",
          "Extra Learning Resources"
        ],
        benefits: [
          "Strong academics + life skills",
          "Daily mentor support for faster learning",
          "Preparedness for competitive exams",
          "Active parent involvement"
        ],
        type: "atal-premium"
      });
    } catch (error) {
      console.error('Failed to initialize default courses:', error);
    }
  }

  // Students
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  // Courses
  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCoursesByClass(classLevel: string): Promise<Course[]> {
    // For simplicity, return all courses for any class level
    return await db.select().from(courses);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse as any)
      .returning();
    return course;
  }

  // Enrollments
  async getEnrollment(id: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment || undefined;
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(enrollments)
      .values(insertEnrollment)
      .returning();
    return enrollment;
  }

  async updateEnrollmentStatus(id: string, status: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .update(enrollments)
      .set({ status })
      .where(eq(enrollments.id, id))
      .returning();
    return enrollment || undefined;
  }

  // Payments
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updatePaymentStatus(id: string, status: string, razorpayPaymentId?: string): Promise<Payment | undefined> {
    const updateData: any = { status };
    if (razorpayPaymentId) {
      updateData.razorpayPaymentId = razorpayPaymentId;
    }

    const [payment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }
}

export const storage = new DatabaseStorage();
