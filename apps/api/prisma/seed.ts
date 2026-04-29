import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { VENUE_CATEGORIES, ITEM_CATEGORIES, PASSWORD_SALT_ROUNDS } from '@tastebuddy/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create venue categories
  console.log('Creating venue categories...');
  for (const cat of VENUE_CATEGORIES) {
    await prisma.venueCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
      },
    });
  }

  // Create item categories with rating criteria
  console.log('Creating item categories with rating criteria...');
  for (const [key, cat] of Object.entries(ITEM_CATEGORIES)) {
    const category = await prisma.itemCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        type: cat.type,
      },
    });

    // Create rating criteria for this category
    for (let i = 0; i < cat.criteria.length; i++) {
      const criterion = cat.criteria[i];
      await prisma.ratingCriterion.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: criterion.name,
          },
        },
        update: {},
        create: {
          categoryId: category.id,
          name: criterion.name,
          label: criterion.label,
          weight: criterion.weight,
          order: i,
        },
      });
    }
  }

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', PASSWORD_SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'admin@tastebuddy.app' },
    update: {},
    create: {
      email: 'admin@tastebuddy.app',
      passwordHash: adminPassword,
      username: 'admin',
      displayName: 'TasteBuddy Admin',
      isAdmin: true,
      isVerified: true,
    },
  });

  // Create test user
  console.log('Creating test user...');
  const testPassword = await bcrypt.hash('Test1234!', PASSWORD_SALT_ROUNDS);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: testPassword,
      username: 'testuser',
      displayName: 'Test User',
      bio: 'Pizza enthusiast and coffee lover',
      isVerified: true,
    },
  });

  // Get restaurant category for sample venues
  const restaurantCategory = await prisma.venueCategory.findUnique({
    where: { slug: 'restaurant' },
  });

  const barCategory = await prisma.venueCategory.findUnique({
    where: { slug: 'bar' },
  });

  const cafeCategory = await prisma.venueCategory.findUnique({
    where: { slug: 'cafe' },
  });

  if (restaurantCategory) {
    // Create sample venues
    console.log('Creating sample venues...');
    
    const pizzaVenue = await prisma.venue.upsert({
      where: { slug: 'pizza-palace-nyc' },
      update: {},
      create: {
        name: 'Pizza Palace',
        slug: 'pizza-palace-nyc',
        description: 'Authentic Italian pizza made with love',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001',
        latitude: 40.7128,
        longitude: -74.0060,
        categoryId: restaurantCategory.id,
        priceLevel: 2,
        phone: '+1-555-123-4567',
        website: 'https://pizzapalace.example.com',
        hours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '12:00', close: '23:00' },
          sunday: { open: '12:00', close: '21:00' },
        },
        isVerified: true,
      },
    });

    // Create sample items for the pizza venue
    const pizzaCategory = await prisma.itemCategory.findUnique({
      where: { slug: 'pizza' },
    });

    if (pizzaCategory) {
      console.log('Creating sample menu items...');
      
      await prisma.item.upsert({
        where: {
          venueId_slug: {
            venueId: pizzaVenue.id,
            slug: 'margherita-pizza',
          },
        },
        update: {},
        create: {
          venueId: pizzaVenue.id,
          categoryId: pizzaCategory.id,
          name: 'Margherita Pizza',
          slug: 'margherita-pizza',
          description: 'Fresh mozzarella, San Marzano tomatoes, basil, olive oil',
          price: 18.99,
          currency: 'USD',
          isVerified: true,
        },
      });

      await prisma.item.upsert({
        where: {
          venueId_slug: {
            venueId: pizzaVenue.id,
            slug: 'pepperoni-pizza',
          },
        },
        update: {},
        create: {
          venueId: pizzaVenue.id,
          categoryId: pizzaCategory.id,
          name: 'Pepperoni Pizza',
          slug: 'pepperoni-pizza',
          description: 'Classic pepperoni with mozzarella and tomato sauce',
          price: 20.99,
          currency: 'USD',
          isVerified: true,
        },
      });
    }
  }

  // Create a sample bar
  if (barCategory) {
    const cocktailBar = await prisma.venue.upsert({
      where: { slug: 'the-cocktail-lounge-nyc' },
      update: {},
      create: {
        name: 'The Cocktail Lounge',
        slug: 'the-cocktail-lounge-nyc',
        description: 'Craft cocktails in an elegant setting',
        address: '456 Park Ave',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10002',
        latitude: 40.7580,
        longitude: -73.9855,
        categoryId: barCategory.id,
        priceLevel: 3,
        isVerified: true,
      },
    });

    const cocktailCategory = await prisma.itemCategory.findUnique({
      where: { slug: 'cocktail' },
    });

    if (cocktailCategory) {
      await prisma.item.upsert({
        where: {
          venueId_slug: {
            venueId: cocktailBar.id,
            slug: 'old-fashioned',
          },
        },
        update: {},
        create: {
          venueId: cocktailBar.id,
          categoryId: cocktailCategory.id,
          name: 'Old Fashioned',
          slug: 'old-fashioned',
          description: 'Bourbon, sugar, bitters, orange peel',
          price: 15.00,
          currency: 'USD',
          isVerified: true,
        },
      });
    }
  }

  // Create a sample cafe
  if (cafeCategory) {
    const cafe = await prisma.venue.upsert({
      where: { slug: 'morning-brew-nyc' },
      update: {},
      create: {
        name: 'Morning Brew',
        slug: 'morning-brew-nyc',
        description: 'Specialty coffee and fresh pastries',
        address: '789 Coffee Lane',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10003',
        latitude: 40.7300,
        longitude: -73.9950,
        categoryId: cafeCategory.id,
        priceLevel: 2,
        isVerified: true,
      },
    });

    const coffeeCategory = await prisma.itemCategory.findUnique({
      where: { slug: 'coffee' },
    });

    if (coffeeCategory) {
      await prisma.item.upsert({
        where: {
          venueId_slug: {
            venueId: cafe.id,
            slug: 'espresso',
          },
        },
        update: {},
        create: {
          venueId: cafe.id,
          categoryId: coffeeCategory.id,
          name: 'Espresso',
          slug: 'espresso',
          description: 'Double shot of our signature blend',
          price: 4.50,
          currency: 'USD',
          isVerified: true,
        },
      });

      await prisma.item.upsert({
        where: {
          venueId_slug: {
            venueId: cafe.id,
            slug: 'cappuccino',
          },
        },
        update: {},
        create: {
          venueId: cafe.id,
          categoryId: coffeeCategory.id,
          name: 'Cappuccino',
          slug: 'cappuccino',
          description: 'Espresso with steamed milk foam',
          price: 5.50,
          currency: 'USD',
          isVerified: true,
        },
      });
    }
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
