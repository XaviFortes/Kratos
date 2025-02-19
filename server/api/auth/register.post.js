import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // try {

    // 1. Create local user
    const user = await createLocalUser(body)

    // 2. Create Invoice Ninja client
    const client = await $fetch('https://invoice.inovexservices.com/api/v1/clients', {
        method: 'POST',
        headers: {
            'X-API-TOKEN': process.env.INVOICE_NINJA_TOKEN,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
        },
        body: {
            name: body.name,
            contacts: [{ email: body.email }]
        }
    })
    console.log('User created in Invoice Ninja:', client.data)

    // 3. Update user with Invoice Ninja ID
    await prisma.users.update({
        where: { id: user.id },
        data: { invoice_ninja_client_id: client.data.id }
    })
    console.log('User updated with Invoice Ninja ID')

    // 4. Associate temp cart with new user
    // if (tempCartId) {
    //     await associateCartWithUser(tempCartId, user.id)
    // }

    return {
        user
    }
    // }
    // catch (error) {
        // throw createError({
            // statusCode: error.response?.status || 500,
            // statusMessage: 'User creation failed',
            // data: error.response?.data
        // })
    // }
})

async function createLocalUser(data) {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
        where: { email: data.email }
    })
    if (existingUser) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User already exists'
        })
    }
    return prisma.users.create({
        data: {
            email: data.email,
            password_hash: await bcrypt.hash(data.password, 10),
            name: data.name
        }
    })
}