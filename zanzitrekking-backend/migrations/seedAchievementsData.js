const mongoose = require("mongoose");
const logger = require('./../utilities/logger');
require("dotenv").config();
const Achievement = require("../models/achievement");
const ImpactStat = require("../models/impactStat");
const Client = require("../models/client");
const { dbConnect } = require("../utilities/db");

const seedData = async () => {
  try {
    await dbConnect();
    logger.info("Connected to database");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Achievement.deleteMany({});
    // await ImpactStat.deleteMany({});
    // await Client.deleteMany({});

    // Seed Achievements (Certifications)
    const certifications = [
      {
        name: "TATO",
        fullName: "Tanzania Association of Tour Operators",
        status: "Active Member",
        imageUrl: "/images/tato.webp",
        icon: "Compass",
        color: "bg-primary-50",
        iconColor: "text-primary-600",
        type: "certification",
        order: 1,
        isActive: true,
      },
      {
        name: "KGA",
        fullName: "Kilimanjaro Guide Association",
        status: "Certified Member",
        icon: "Award",
        color: "bg-secondary-50",
        iconColor: "text-secondary-600",
        type: "certification",
        order: 2,
        isActive: true,
      },
      {
        name: "TTGA",
        fullName: "Tanzania Tour Guides Association",
        status: "Active Member",
        imageUrl: "/images/ttga.jpg",
        icon: "Users",
        color: "bg-accent-50",
        iconColor: "text-accent-600",
        type: "certification",
        order: 3,
        isActive: true,
      },
      {
        name: "TGS",
        fullName: "Tanzania Guide Society",
        status: "Member",
        icon: "Shield",
        color: "bg-primary-50",
        iconColor: "text-primary-600",
        type: "certification",
        order: 4,
        isActive: true,
      },
      {
        name: "KPAP",
        fullName: "Kilimanjaro Porters Assistance Project",
        status: "In Monitoring Phase",
        imageUrl: "/images/kpap.jpg",
        icon: "Heart",
        color: "bg-highlight-50",
        iconColor: "text-highlight-600",
        type: "certification",
        order: 5,
        isActive: true,
      },
    ];

    // Seed Awards
    const awards = [
      {
        name: "TripAdvisor Excellence",
        fullName: "TripAdvisor Excellence",
        status: "2024-2025",
        icon: "Award",
        color: "bg-primary-50",
        iconColor: "text-primary-600",
        type: "award",
        order: 1,
        isActive: true,
      },
      {
        name: "Best Safari Operator",
        fullName: "Best Safari Operator",
        status: "2024",
        icon: "Star",
        color: "bg-primary-50",
        iconColor: "text-primary-600",
        type: "award",
        order: 2,
        isActive: true,
      },
      {
        name: "Safety Excellence",
        fullName: "Safety Excellence",
        status: "2023-2024",
        icon: "Shield",
        color: "bg-primary-50",
        iconColor: "text-primary-600",
        type: "award",
        order: 3,
        isActive: true,
      },
    ];

    // Seed Impact Stats
    const impactStats = [
      {
        value: 142500,
        label: "DONATED TO WILDLIFE",
        sublabel: "CONSERVATION IN 2024",
        prefix: "$ ",
        suffix: "",
        labelStyle: "normal",
        duration: 2000,
        order: 1,
        isActive: true,
      },
      {
        value: 1205000,
        label: "PAID ANNUALLY IN TAXES",
        sublabel: "IN TANZANIA",
        prefix: "$ ",
        suffix: "",
        labelStyle: "normal",
        duration: 2000,
        order: 2,
        isActive: true,
      },
      {
        value: 400,
        label: "TONNES OF CARBON",
        sublabel: "OFFSET",
        prefix: "",
        suffix: " +",
        labelStyle: "normal",
        duration: 2000,
        order: 3,
        isActive: true,
      },
      {
        value: 48,
        label: "children",
        sublabel: "SPONSORED TO GET AN EDUCATION",
        prefix: "",
        suffix: "",
        labelStyle: "italic",
        duration: 1500,
        order: 4,
        isActive: true,
      },
      {
        value: 15300,
        label: "trees",
        sublabel: "PLANTED IN 2024",
        prefix: "",
        suffix: "",
        labelStyle: "italic",
        duration: 2500,
        order: 5,
        isActive: true,
      },
      {
        value: 250,
        label: "FULL-TIME JOBS",
        sublabel: "CREATED",
        prefix: "",
        suffix: " +",
        labelStyle: "normal",
        duration: 1800,
        order: 6,
        isActive: true,
      },
      {
        value: 48,
        label: "OF EMPLOYEES",
        sublabel: "ARE WOMEN",
        prefix: "",
        suffix: " %",
        labelStyle: "normal",
        duration: 1500,
        order: 7,
        isActive: true,
      },
    ];

    // Seed Clients
    const clients = [
      { name: "Google", logoUrl: "https://logo.clearbit.com/google.com", order: 1, isActive: true },
      { name: "Microsoft", logoUrl: "https://logo.clearbit.com/microsoft.com", order: 2, isActive: true },
      { name: "Amazon", logoUrl: "https://logo.clearbit.com/amazon.com", order: 3, isActive: true },
      { name: "Apple", logoUrl: "https://logo.clearbit.com/apple.com", order: 4, isActive: true },
      { name: "Meta", logoUrl: "https://logo.clearbit.com/meta.com", order: 5, isActive: true },
      { name: "Tesla", logoUrl: "https://logo.clearbit.com/tesla.com", order: 6, isActive: true },
      { name: "SpaceX", logoUrl: "https://logo.clearbit.com/spacex.com", order: 7, isActive: true },
      { name: "Netflix", logoUrl: "https://logo.clearbit.com/netflix.com", order: 8, isActive: true },
      { name: "Adobe", logoUrl: "https://www.adobe.com/favicon.ico", order: 9, isActive: true },
      { name: "Oracle", logoUrl: "https://logo.clearbit.com/oracle.com", order: 10, isActive: true },
      { name: "IBM", logoUrl: "https://www.ibm.com/favicon.ico", order: 11, isActive: true },
      { name: "Samsung", logoUrl: "https://logo.clearbit.com/samsung.com", order: 12, isActive: true },
      { name: "Sony", logoUrl: "https://logo.clearbit.com/sony.com", order: 13, isActive: true },
      { name: "Toyota", logoUrl: "https://logo.clearbit.com/toyota.com", order: 14, isActive: true },
      { name: "BMW", logoUrl: "https://logo.clearbit.com/bmw.com", order: 15, isActive: true },
    ];

    // Insert data
    const insertedCertifications = await Achievement.insertMany(certifications);
    logger.info(`Inserted ${insertedCertifications.length} certifications`);

    const insertedAwards = await Achievement.insertMany(awards);
    logger.info(`Inserted ${insertedAwards.length} awards`);

    const insertedImpactStats = await ImpactStat.insertMany(impactStats);
    logger.info(`Inserted ${insertedImpactStats.length} impact stats`);

    const insertedClients = await Client.insertMany(clients);
    logger.info(`Inserted ${insertedClients.length} clients`);

    logger.info("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Migration error:", error);
    process.exit(1);
  }
};

// Run migration
seedData();

