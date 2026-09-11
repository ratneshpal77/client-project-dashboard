import bcrypt from "bcrypt";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  console.log("🌱 Starting database seed...");

  
  // CLEAN EXISTING DATA
  

  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  
  // PASSWORDS
  

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const pmPassword = await bcrypt.hash("Manager@123", 12);
  const developerPassword = await bcrypt.hash("Developer@123", 12);

  
  // USERS
  

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@agency.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: "Rahul Manager",
      email: "pm1@agency.com",
      passwordHash: pmPassword,
      role: "PROJECT_MANAGER",
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: "Priya Manager",
      email: "pm2@agency.com",
      passwordHash: pmPassword,
      role: "PROJECT_MANAGER",
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: "Ravi Developer",
      email: "dev1@agency.com",
      passwordHash: developerPassword,
      role: "DEVELOPER",
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: "Amit Developer",
      email: "dev2@agency.com",
      passwordHash: developerPassword,
      role: "DEVELOPER",
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: "Neha Developer",
      email: "dev3@agency.com",
      passwordHash: developerPassword,
      role: "DEVELOPER",
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: "Karan Developer",
      email: "dev4@agency.com",
      passwordHash: developerPassword,
      role: "DEVELOPER",
    },
  });

  console.log("✅ Users created");

  
  // CLIENTS
  

  const client1 = await prisma.client.create({
    data: {
      name: "Arjun Mehta",
      email: "arjun@techcorp.com",
      company: "TechCorp Solutions",
      phone: "9876543210",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Sneha Shah",
      email: "sneha@retailhub.com",
      company: "RetailHub",
      phone: "9876543211",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: "Vikram Patel",
      email: "vikram@finserve.com",
      company: "FinServe India",
      phone: "9876543212",
    },
  });

  console.log("✅ Clients created");


  // PROJECTS


  const project1 = await prisma.project.create({
    data: {
      name: "TechCorp Website",
      description: "Corporate website redesign for TechCorp.",
      clientId: client1.id,
      createdBy: pm1.id,
      managerId: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "RetailHub E-commerce",
      description: "E-commerce platform for RetailHub.",
      clientId: client2.id,
      createdBy: pm1.id,
      managerId: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "FinServe Dashboard",
      description: "Financial analytics dashboard.",
      clientId: client3.id,
      createdBy: pm2.id,
      managerId: pm2.id,
    },
  });

  console.log("✅ Projects created");

  

  const now = new Date();

  const overdueDate1 = new Date();
  overdueDate1.setDate(now.getDate() - 10);

  const overdueDate2 = new Date();
  overdueDate2.setDate(now.getDate() - 5);

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

 

  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Create homepage",
      description: "Build responsive homepage.",
      assignedDeveloperId: dev1.id,
      status: "DONE",
      priority: "HIGH",
      dueDate: overdueDate1,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Build authentication",
      description: "Implement login and registration.",
      assignedDeveloperId: dev2.id,
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      dueDate: tomorrow,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Create contact page",
      description: "Build contact form and validation.",
      assignedDeveloperId: dev3.id,
      status: "TODO",
      priority: "MEDIUM",
      dueDate: nextWeek,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "API integration",
      description: "Connect frontend with backend APIs.",
      assignedDeveloperId: dev1.id,
      status: "IN_REVIEW",
      priority: "HIGH",
      dueDate: tomorrow,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Responsive testing",
      description: "Test website on different screen sizes.",
      assignedDeveloperId: dev4.id,
      status: "TODO",
      priority: "LOW",
      dueDate: nextWeek,
    },
  });

  

  const task6 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Product listing",
      description: "Build product listing page.",
      assignedDeveloperId: dev2.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: tomorrow,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Shopping cart",
      description: "Implement shopping cart.",
      assignedDeveloperId: dev3.id,
      status: "TODO",
      priority: "CRITICAL",
      dueDate: nextWeek,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Payment integration",
      description: "Integrate payment gateway.",
      assignedDeveloperId: dev4.id,
      status: "IN_REVIEW",
      priority: "CRITICAL",
      dueDate: nextWeek,
    },
  });

  const task9 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Order management",
      description: "Create order management APIs.",
      assignedDeveloperId: dev1.id,
      status: "DONE",
      priority: "HIGH",
      dueDate: overdueDate2,
    },
  });

  const task10 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "E-commerce testing",
      description: "Run end-to-end tests.",
      assignedDeveloperId: dev2.id,
      status: "TODO",
      priority: "MEDIUM",
      dueDate: nextWeek,
    },
  });



  const task11 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Dashboard layout",
      description: "Create analytics dashboard UI.",
      assignedDeveloperId: dev3.id,
      status: "DONE",
      priority: "HIGH",
      dueDate: tomorrow,
    },
  });

  const task12 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Analytics API",
      description: "Build analytics API.",
      assignedDeveloperId: dev4.id,
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      dueDate: nextWeek,
    },
  });

  const task13 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Charts implementation",
      description: "Implement dashboard charts.",
      assignedDeveloperId: dev1.id,
      status: "TODO",
      priority: "MEDIUM",
      dueDate: nextWeek,
    },
  });

  const task14 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Export reports",
      description: "Implement report export functionality.",
      assignedDeveloperId: dev2.id,
      status: "IN_REVIEW",
      priority: "HIGH",
      dueDate: tomorrow,
    },
  });

  const task15 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Dashboard security",
      description: "Implement dashboard access security.",
      assignedDeveloperId: dev4.id,
      status: "TODO",
      priority: "CRITICAL",
      dueDate: nextWeek,
    },
  });

  console.log("✅ 15 tasks created");

  

  await prisma.activity.createMany({
    data: [
      {
        projectId: project1.id,
        taskId: task1.id,
        userId: dev1.id,
        action: "TASK_STATUS_CHANGED",
        oldValue: "IN_PROGRESS",
        newValue: "DONE",
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        projectId: project1.id,
        taskId: task2.id,
        userId: dev2.id,
        action: "TASK_STATUS_CHANGED",
        oldValue: "TODO",
        newValue: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        projectId: project1.id,
        taskId: task4.id,
        userId: dev1.id,
        action: "TASK_STATUS_CHANGED",
        oldValue: "IN_PROGRESS",
        newValue: "IN_REVIEW",
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        projectId: project2.id,
        taskId: task8.id,
        userId: dev4.id,
        action: "TASK_STATUS_CHANGED",
        oldValue: "IN_PROGRESS",
        newValue: "IN_REVIEW",
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        projectId: project3.id,
        taskId: task12.id,
        userId: dev4.id,
        action: "TASK_STATUS_CHANGED",
        oldValue: "TODO",
        newValue: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Activity logs created");

  

  await prisma.notification.createMany({
    data: [
      {
        userId: dev2.id,
        taskId: task2.id,
        type: "TASK_ASSIGNED",
        message: "You have been assigned to Build authentication",
      },
      {
        userId: dev4.id,
        taskId: task12.id,
        type: "TASK_ASSIGNED",
        message: "You have been assigned to Analytics API",
      },
      {
        userId: pm1.id,
        taskId: task8.id,
        type: "TASK_MOVED_TO_REVIEW",
        message: "Payment integration was moved to In Review",
      },
    ],
  });

  console.log("✅ Notifications created");

  console.log("");
  console.log("========================================");
  console.log("🌱 DATABASE SEED COMPLETED");
  console.log("========================================");
  console.log("");
  console.log("Admin:");
  console.log("Email: admin@agency.com");
  console.log("Password: Admin@123");
  console.log("");
  console.log("PM 1:");
  console.log("Email: pm1@agency.com");
  console.log("Password: Manager@123");
  console.log("");
  console.log("PM 2:");
  console.log("Email: pm2@agency.com");
  console.log("Password: Manager@123");
  console.log("");
  console.log("Developers:");
  console.log("dev1@agency.com");
  console.log("dev2@agency.com");
  console.log("dev3@agency.com");
  console.log("dev4@agency.com");
  console.log("Password: Developer@123");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
