
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID || "",
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            // Pass the access token to the client if needed (Session strategy)
            // Or just user info
            return session
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        }
    },
    pages: {
        signIn: '/', // Using custom modal on home page
    },
    secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
