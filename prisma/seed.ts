import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "joe@joescript.io";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("joes-pantry", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const beansOnToast = await prisma.recipe.create({
    data: {
      name: 'Beans on Toast',
      userId: user.id,
      ingredients: {
        createMany: {
          data: [
            {
              name: 'Beans',
              quantity: 1,
              unit: 'tin'
            },

            {
              name: 'Butter',
              quantity: 20,
              unit: 'grams'
            },
            {
              name: 'Bread',
              quantity: 1,
              unit: 'loaf',
            },
          ]
        },
      },
    }
  })

  const macAndCheese = await prisma.recipe.create({
    data: {
      name: 'Mac and cheese',
      userId: user.id,
      ingredients: {
        createMany: {
          data: [
            {
              name: 'Macaroni',
              quantity: 500,
              unit: 'grams',
            },
            {
              name: 'cheese',
              quantity: 400,
              unit: 'grams',
            },
          ],
        }
      },
    }
  })

  await prisma.shoppingRecipe.createMany({
    data: [{
      recipeId: beansOnToast.id,
      userId: user.id,
    }, {
      recipeId: macAndCheese.id,
      userId: user.id,
    }
    ]
  })

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.oddBit.createMany({
    data: [
      {
        name: 'DC',
        userId: user.id,
      },
      {
        name: 'bananas',
        userId: user.id,
      },
    ]
  })

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
