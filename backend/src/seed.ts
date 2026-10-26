import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create a Provider Admin
  const providerAdmin = await prisma.providerAdmin.upsert({
    where: { email: 'admin@provider.com' },
    update: {},
    create: {
      email: 'admin@provider.com',
      password: 'hashedpassword_placeholder', // In a real app, always hash passwords
      name: 'Super Admin',
    },
  })
  console.log({ providerAdmin })

  // 2. Create Huber Heights Church of God
  const church = await prisma.church.create({
    data: {
      name: 'Huber Heights Church of God',
      address: '6900 Brandt Pike',
      city: 'Huber Heights',
      state: 'OH',
      zip: '45424',
      latitude: 39.8643, // Approximate coordinates
      longitude: -84.1166,
      isActive: true, // Auto-activated for demo
      admins: {
        create: {
          email: 'admin@huberheightscog.com',
          password: 'hashedpassword_placeholder',
          name: 'Church Admin',
        }
      },
      services: {
        create: {
          title: 'Sunday Morning Service',
          date: new Date(),
          isActive: true, // Make this the active service for the QR code
          items: {
            create: [
              {
                type: 'ANNOUNCEMENT',
                title: 'Welcome!',
                content: 'Welcome to Huber Heights Church of God. We are glad you are here.',
                order: 1
              },
              {
                type: 'SONG',
                title: 'Amazing Grace',
                content: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.',
                order: 2
              },
              {
                type: 'SCRIPTURE',
                title: 'Morning Reading',
                reference: 'John 3:16',
                content: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
                order: 3
              },
              {
                type: 'SERMON',
                title: 'The Love of God',
                content: 'Pastor Notes:\n1. God\'s love is unconditional.\n2. God\'s love is sacrificial.',
                order: 4
              }
            ]
          }
        }
      }
    },
  })
  console.log({ church })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
