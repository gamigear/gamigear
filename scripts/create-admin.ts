import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'dteanh';
  const password = 'Shiina1!';
  const email = 'dteanh@admin.com';
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    }
  });
  
  if (existingUser) {
    // Update existing user
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        role: 'administrator',
        isActive: true,
      }
    });
    console.log('Updated existing user:', updated.username, 'with role:', updated.role);
  } else {
    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Administrator',
        role: 'administrator',
        isActive: true,
      }
    });
    console.log('Created new admin user:', user.username, 'with role:', user.role);
  }
  
  console.log('\nLogin credentials:');
  console.log('Username:', username);
  console.log('Password:', password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
