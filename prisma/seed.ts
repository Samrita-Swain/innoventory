import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@innoventory.com' },
    update: {},
    create: {
      email: 'admin@innoventory.com',
      name: 'John Admin',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  // Create admin permissions
  const adminPermissions = ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
  for (const permission of adminPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permission: {
          userId: admin.id,
          permission: permission as any,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        permission: permission as any,
      },
    })
  }

  // Create sub-admin user
  const subAdminPassword = await hashPassword('subadmin123')
  const subAdmin = await prisma.user.upsert({
    where: { email: 'subadmin@innoventory.com' },
    update: {},
    create: {
      email: 'subadmin@innoventory.com',
      name: 'Jane SubAdmin',
      password: subAdminPassword,
      role: 'SUB_ADMIN',
      isActive: true,
      createdById: admin.id,
    },
  })

  // Create sub-admin permissions
  const subAdminPermissions = [
    'MANAGE_CUSTOMERS',
    'MANAGE_ORDERS',
    'VIEW_ANALYTICS',
  ]
  for (const permission of subAdminPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permission: {
          userId: subAdmin.id,
          permission: permission as any,
        },
      },
      update: {},
      create: {
        userId: subAdmin.id,
        permission: permission as any,
      },
    })
  }

  // Create customers
  const customers = [
    {
      name: 'TechCorp Inc.',
      email: 'contact@techcorp.com',
      phone: '+1-555-0101',
      company: 'TechCorp Inc.',
      country: 'United States',
      address: '123 Tech Street, Silicon Valley, CA',
      createdById: admin.id,
    },
    {
      name: 'Innovation Labs',
      email: 'info@innovationlabs.com',
      phone: '+44-20-7946-0958',
      company: 'Innovation Labs Ltd.',
      country: 'United Kingdom',
      address: '456 Innovation Ave, London, UK',
      createdById: subAdmin.id,
    },
    {
      name: 'StartupXYZ',
      email: 'hello@startupxyz.com',
      phone: '+49-30-12345678',
      company: 'StartupXYZ GmbH',
      country: 'Germany',
      address: '789 Startup Blvd, Berlin, Germany',
      createdById: subAdmin.id,
    },
    {
      name: 'Future Tech Solutions',
      email: 'contact@futuretech.ca',
      phone: '+1-416-555-0123',
      company: 'Future Tech Solutions Inc.',
      country: 'Canada',
      address: '321 Future Lane, Toronto, ON',
      createdById: admin.id,
    },
  ]

  const createdCustomers = []
  for (const customer of customers) {
    const created = await prisma.customer.upsert({
      where: { email: customer.email },
      update: {},
      create: customer,
    })
    createdCustomers.push(created)
  }

  // Create vendors
  const vendors = [
    {
      name: 'IP Legal Services',
      email: 'services@iplegal.com',
      phone: '+1-555-0201',
      company: 'IP Legal Services LLC',
      country: 'United States',
      address: '100 Legal Plaza, New York, NY',
      specialization: 'Patent Law',
      createdById: admin.id,
    },
    {
      name: 'Global Patent Experts',
      email: 'experts@globalpatent.com',
      phone: '+91-11-12345678',
      company: 'Global Patent Experts Pvt Ltd',
      country: 'India',
      address: '200 Patent Street, New Delhi, India',
      specialization: 'International Patents',
      createdById: admin.id,
    },
    {
      name: 'Trademark Specialists',
      email: 'info@trademarkspec.co.uk',
      phone: '+44-20-7946-0959',
      company: 'Trademark Specialists Ltd',
      country: 'United Kingdom',
      address: '300 Trademark Road, Manchester, UK',
      specialization: 'Trademark Registration',
      createdById: subAdmin.id,
    },
  ]

  const createdVendors = []
  for (const vendor of vendors) {
    const created = await prisma.vendor.upsert({
      where: { email: vendor.email },
      update: {},
      create: vendor,
    })
    createdVendors.push(created)
  }

  // Create orders
  const orders = [
    {
      referenceNumber: 'IP-2024-001',
      title: 'Patent Application for AI Algorithm',
      description: 'Machine learning algorithm for predictive analytics',
      type: 'PATENT',
      status: 'PENDING_WITH_CLIENT',
      country: 'United States',
      priority: 'URGENT',
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-12-15'),
      amount: 2500.00,
      paidAmount: 0,
      customerId: createdCustomers[0].id,
      vendorId: createdVendors[0].id,
      assignedToId: subAdmin.id,
    },
    {
      referenceNumber: 'IP-2024-002',
      title: 'Trademark Registration for Brand Logo',
      description: 'Company logo trademark registration',
      type: 'TRADEMARK',
      status: 'IN_PROGRESS',
      country: 'United Kingdom',
      priority: 'HIGH',
      startDate: new Date('2024-02-01'),
      dueDate: new Date('2024-08-01'),
      amount: 1800.00,
      paidAmount: 900.00,
      customerId: createdCustomers[1].id,
      vendorId: createdVendors[2].id,
      assignedToId: subAdmin.id,
    },
    {
      referenceNumber: 'IP-2024-003',
      title: 'Copyright Filing for Software',
      description: 'Software copyright protection',
      type: 'COPYRIGHT',
      status: 'COMPLETED',
      country: 'Germany',
      priority: 'MEDIUM',
      startDate: new Date('2024-01-10'),
      dueDate: new Date('2024-06-10'),
      completedDate: new Date('2024-05-15'),
      amount: 1200.00,
      paidAmount: 1200.00,
      customerId: createdCustomers[2].id,
      vendorId: createdVendors[1].id,
      assignedToId: admin.id,
    },
    {
      referenceNumber: 'IP-2024-004',
      title: 'Design Patent for Product',
      description: 'Industrial design patent application',
      type: 'DESIGN',
      status: 'YET_TO_START',
      country: 'Canada',
      priority: 'MEDIUM',
      dueDate: new Date('2024-10-01'),
      amount: 2000.00,
      paidAmount: 0,
      customerId: createdCustomers[3].id,
      vendorId: createdVendors[0].id,
      assignedToId: admin.id,
    },
  ]

  const createdOrders = []
  for (const order of orders) {
    const created = await prisma.order.upsert({
      where: { referenceNumber: order.referenceNumber },
      update: {},
      create: order as any,
    })
    createdOrders.push(created)
  }

  // Create invoices
  const invoices = [
    {
      invoiceNumber: 'INV-2024-001',
      orderId: createdOrders[0].id,
      amount: 2500.00,
      paidAmount: 0,
      status: 'PENDING',
      dueDate: new Date('2024-07-15'),
    },
    {
      invoiceNumber: 'INV-2024-002',
      orderId: createdOrders[1].id,
      amount: 1800.00,
      paidAmount: 900.00,
      status: 'PENDING',
      dueDate: new Date('2024-07-01'),
    },
    {
      invoiceNumber: 'INV-2024-003',
      orderId: createdOrders[2].id,
      amount: 1200.00,
      paidAmount: 1200.00,
      status: 'PAID',
      dueDate: new Date('2024-04-10'),
      paidDate: new Date('2024-04-05'),
    },
  ]

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: invoice.invoiceNumber },
      update: {},
      create: invoice as any,
    })
  }

  // Create activity logs
  const activities = [
    {
      action: 'ORDER_CREATED',
      description: 'Created new patent application order',
      entityType: 'Order',
      entityId: createdOrders[0].id,
      userId: admin.id,
      orderId: createdOrders[0].id,
    },
    {
      action: 'ORDER_UPDATED',
      description: 'Updated order status to "In Progress"',
      entityType: 'Order',
      entityId: createdOrders[1].id,
      userId: subAdmin.id,
      orderId: createdOrders[1].id,
    },
    {
      action: 'CUSTOMER_CREATED',
      description: 'Added new customer "StartupXYZ"',
      entityType: 'Customer',
      entityId: createdCustomers[2].id,
      userId: subAdmin.id,
    },
  ]

  for (const activity of activities) {
    await prisma.activityLog.create({
      data: activity,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin user: admin@innoventory.com / admin123`)
  console.log(`👤 Sub-admin user: subadmin@innoventory.com / subadmin123`)
  console.log(`📊 Created ${createdCustomers.length} customers`)
  console.log(`🏢 Created ${createdVendors.length} vendors`)
  console.log(`📋 Created ${createdOrders.length} orders`)
  console.log(`💰 Created ${invoices.length} invoices`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
