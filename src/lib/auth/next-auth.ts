import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth (redirect flow)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // Google One Tap (credential flow)
    CredentialsProvider({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.credential) {
          return null;
        }

        try {
          // Verify Google ID token
          const ticket = await googleClient.verifyIdToken({
            idToken: credentials.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });

          const payload = ticket.getPayload();
          if (!payload || !payload.email) {
            return null;
          }

          // Check or create customer
          let customer = await prisma.customer.findUnique({
            where: { email: payload.email },
          });

          if (!customer) {
            // Create new customer from Google One Tap
            customer = await prisma.customer.create({
              data: {
                email: payload.email,
                firstName: payload.given_name || "",
                lastName: payload.family_name || "",
                username: payload.email.split("@")[0] + "_" + Date.now(),
                avatarUrl: payload.picture,
              },
            });
          } else if (!customer.avatarUrl && payload.picture) {
            // Update avatar if not set
            await prisma.customer.update({
              where: { id: customer.id },
              data: { avatarUrl: payload.picture },
            });
          }

          return {
            id: customer.id,
            email: customer.email,
            name: `${customer.lastName}${customer.firstName}`,
            image: customer.avatarUrl,
          };
        } catch (error) {
          console.error("Google One Tap verification error:", error);
          return null;
        }
      },
    }),
    
    // Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    
    // Apple OAuth
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
    
    // Kakao OAuth
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
    
    // Naver OAuth
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID || "",
      clientSecret: process.env.NAVER_CLIENT_SECRET || "",
    }),
    
    // Credentials (email/password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const customer = await prisma.customer.findUnique({
          where: { email: credentials.email },
        });

        if (!customer || !customer.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, customer.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: customer.id,
          email: customer.email,
          name: `${customer.lastName}${customer.firstName}`,
          image: customer.avatarUrl,
        };
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth sign in
      if (account && user.email) {
        try {
          // Check if customer exists
          const existingCustomer = await prisma.customer.findUnique({
            where: { email: user.email },
          });

          if (!existingCustomer) {
            // Create new customer from OAuth
            const nameParts = (user.name || "").split(" ");
            const firstName = nameParts.slice(1).join(" ") || user.name || "";
            const lastName = nameParts[0] || "";

            await prisma.customer.create({
              data: {
                email: user.email,
                firstName,
                lastName,
                username: user.email.split("@")[0] + "_" + Date.now(),
                avatarUrl: user.image,
              },
            });
          } else {
            // Update avatar if not set
            if (!existingCustomer.avatarUrl && user.image) {
              await prisma.customer.update({
                where: { id: existingCustomer.id },
                data: { avatarUrl: user.image },
              });
            }
          }

          return true;
        } catch (error) {
          console.error("OAuth sign in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // Get customer from database
        const customer = await prisma.customer.findUnique({
          where: { email: user.email! },
        });

        if (customer) {
          token.userId = customer.id;
          token.role = customer.role;
          token.firstName = customer.firstName;
          token.lastName = customer.lastName;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
