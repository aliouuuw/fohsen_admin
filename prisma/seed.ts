import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';


async function main() {
  console.log('Start seeding ...');

  // --- Cleanup existing data (optional, useful for development) ---
  // Use transaction to ensure atomic deletion if needed, or delete in dependency order
  try {
    await prisma.$transaction([
      prisma.certificate.deleteMany(),
      prisma.quizAttempt.deleteMany(),
      prisma.progress.deleteMany(),
      prisma.enrollment.deleteMany(),
      prisma.resource.deleteMany(),
      prisma.quiz.deleteMany(),
      prisma.course.deleteMany(),
      prisma.module.deleteMany(),
      prisma.formation.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    console.log('Cleaned up existing data.');
  } catch (error) {
    console.error('Error cleaning up data:', error);
    // Decide if you want to stop or continue
  }


  // --- Create an Admin User ---
  const adminPassword = await bcrypt.hash('adminpass', 10); // Replace with a secure default or env var
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fohsen.org',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user with id: ${adminUser.id}`);

  // --- Create a Formation ---
  const formation = await prisma.formation.create({
    data: {
      title: 'Fohsen Platform Masterclass',
      description: 'A comprehensive guide to mastering the Fohsen platform features.',
      thumbnail: 'https://via.placeholder.com/600x400?text=Formation+Thumbnail',
      passingGrade: 75.0,
    },
  });
  console.log(`Created formation with id: ${formation.id}`);

  // --- Create a Module within the Formation ---
  const exampleModule = await prisma.module.create({
    data: {
      title: 'Introduction to Fohsen Interface',
      description: 'Navigate the Fohsen environment and key areas.',
      order: 1,
      level: 'BEGINNER',
      status: 'PUBLISHED', // Set status based on enum
      formationId: formation.id, // Link to the created formation
    },
  });
  console.log(`Created module with id: ${exampleModule.id}`);

  // --- Create a Course within the Module ---
  // Sample Lexical editor state JSON
  const sampleCourseContent = {
    "root": {
      "children": [
        {
          "children": [
            {"detail":0,"format":0,"mode":"normal","text":"Welcome to the first course!","type":"text","version":1}
          ],"direction":null,"format":"","indent":0,"type":"paragraph","version":1
        },
        {
          "children": [
             {"detail":0,"format":1,"mode":"normal","text":"Course Outline","type":"text","version":1}
          ],"direction":null,"format":"","indent":0,"type":"heading","tag":"h2","version":1
        },
         {
          "children": [
             {"detail":0,"format":0,"mode":"normal","text":"Introduction","type":"text","version":1}
          ],"direction":null,"format":"","indent":0,"type":"listitem","version":1,"value":1
        },
         {
          "children": [
             {"detail":0,"format":0,"mode":"normal","text":"Dashboard Navigation","type":"text","version":1}
          ],"direction":null,"format":"","indent":0,"type":"listitem","version":1,"value":2
        },
         {
          "children": [
             {"detail":0,"format":0,"mode":"normal","text":"Settings Overview","type":"text","version":1}
          ],"direction":null,"format":"","indent":0,"type":"listitem","version":1,"value":3
        }
      ],"direction":null,"format":"","indent":0,"type":"root","version":1
    }
  };


  const course = await prisma.course.create({
    data: {
      title: 'Getting Around the Dashboard',
      introduction: 'Learn how to find your way in the Fohsen admin dashboard.',
      objective: 'By the end of this course, you will be able to navigate the main sections of the dashboard.',
      order: 1,
      moduleId: exampleModule.id, // Link to the created module
      content: sampleCourseContent, // Add sample JSON content
      videoTitle: 'Dashboard Navigation Video',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Example video URL
    },
  });
  console.log(`Created course with id: ${course.id}`);

   // --- Create dummy Quiz and Resources for the course to match schema ---
   const quiz = await prisma.quiz.create({
       data: {
           question: "What is the primary area for managing formations?",
           options: ["Settings", "Analytics", "Dashboard", "Formations"],
           correctAnswers: [3], // Index 3 is "Formations"
           courseId: course.id,
       }
   });
   console.log(`Created quiz with id: ${quiz.id}`);

   const resource = await prisma.resource.create({
       data: {
           title: "Dashboard Quick Reference Guide",
           type: "PDF", // Use enum value
           url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/a4.pdf", // Example PDF URL
           description: "A handy PDF guide to the dashboard layout.",
           courseId: course.id,
       }
   });
    console.log(`Created resource with id: ${resource.id}`);


  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });