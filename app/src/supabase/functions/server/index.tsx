import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to generate random codes
function generateCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper to verify user from access token
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return { error: 'Missing authorization header', user: null };
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'Invalid authorization header format', user: null };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { error: 'Invalid or expired token', user: null };
  }

  return { error: null, user };
}

// Health check endpoint
app.get("/make-server-85e399fd/health", (c) => {
  return c.json({ status: "ok" });
});

// ====== AUTH ROUTES ======

// Sign up
app.post("/make-server-85e399fd/auth/signup", async (c) => {
  try {
    const { email, password, name, phoneNumber } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Automatically confirm the user's email since an email server hasn't been configured.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phoneNumber: phoneNumber || '' },
      email_confirm: true
    });

    if (error) {
      console.log('Error during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      phoneNumber: phoneNumber || '',
      role: 'none', // none, guest, resident, owner
      communityId: null,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      userId: data.user.id,
      message: 'User created successfully'
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Sign in
app.post("/make-server-85e399fd/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Error during signin:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${data.user.id}`);

    return c.json({ 
      success: true,
      accessToken: data.session.access_token,
      user: data.user,
      profile: userProfile
    });
  } catch (error) {
    console.log('Signin error:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

// Get current user profile
app.get("/make-server-85e399fd/auth/me", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const profile = await kv.get(`user:${user.id}`);
  
  return c.json({ user, profile });
});

// ====== COMMUNITY ROUTES ======

// Create community (Owner only, requires authorization code)
app.post("/make-server-85e399fd/communities/create", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { name, address, authorizationCode } = await c.req.json();

    if (!name || !address || !authorizationCode) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Verify authorization code (for demo, we accept specific codes)
    // In production, this would verify against a central authority
    const validAuthCodes = await kv.get('valid_auth_codes') || ['SILL2025', 'OWNER123', 'ADMIN456'];
    
    if (!validAuthCodes.includes(authorizationCode)) {
      return c.json({ error: 'Invalid authorization code' }, 403);
    }

    // Generate community ID
    const communityId = `community_${Date.now()}_${generateCode(6)}`;

    // Create community
    const community = {
      id: communityId,
      name,
      address,
      ownerId: user.id,
      ownerName: user.user_metadata?.name || 'Owner',
      memberCount: 1,
      createdAt: new Date().toISOString(),
      settings: {
        allowGuestViewing: false,
        requireApproval: true
      }
    };

    await kv.set(`community:${communityId}`, community);

    // Update user profile to owner role
    const userProfile = await kv.get(`user:${user.id}`) || {};
    userProfile.role = 'owner';
    userProfile.communityId = communityId;
    await kv.set(`user:${user.id}`, userProfile);

    // Add owner to community members
    await kv.set(`community:${communityId}:members`, [
      {
        userId: user.id,
        name: user.user_metadata?.name || 'Owner',
        email: user.email,
        role: 'owner',
        joinedAt: new Date().toISOString()
      }
    ]);

    return c.json({ 
      success: true,
      community,
      message: 'Community created successfully'
    });
  } catch (error) {
    console.log('Error creating community:', error);
    return c.json({ error: 'Internal server error while creating community' }, 500);
  }
});

// Generate join code (Owner only)
app.post("/make-server-85e399fd/communities/:communityId/generate-code", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const communityId = c.req.param('communityId');
    const community = await kv.get(`community:${communityId}`);

    if (!community) {
      return c.json({ error: 'Community not found' }, 404);
    }

    // Verify user is owner
    if (community.ownerId !== user.id) {
      return c.json({ error: 'Only community owner can generate join codes' }, 403);
    }

    const { recipientName, expiresInDays = 7 } = await c.req.json();

    // Generate unique join code
    const joinCode = generateCode(8);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const codeData = {
      code: joinCode,
      communityId,
      communityName: community.name,
      recipientName: recipientName || '',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      used: false
    };

    await kv.set(`joincode:${joinCode}`, codeData);

    return c.json({ 
      success: true,
      joinCode,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.log('Error generating join code:', error);
    return c.json({ error: 'Internal server error while generating join code' }, 500);
  }
});

// Join community with code
app.post("/make-server-85e399fd/communities/join", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { joinCode } = await c.req.json();

    if (!joinCode) {
      return c.json({ error: 'Join code is required' }, 400);
    }

    // Get code data
    const codeData = await kv.get(`joincode:${joinCode}`);

    if (!codeData) {
      return c.json({ error: 'Invalid join code' }, 404);
    }

    // Check if code is used
    if (codeData.used) {
      return c.json({ error: 'This join code has already been used' }, 400);
    }

    // Check if code is expired
    if (new Date(codeData.expiresAt) < new Date()) {
      return c.json({ error: 'This join code has expired' }, 400);
    }

    const communityId = codeData.communityId;
    const community = await kv.get(`community:${communityId}`);

    if (!community) {
      return c.json({ error: 'Community not found' }, 404);
    }

    // Add user to community
    const members = await kv.get(`community:${communityId}:members`) || [];
    
    // Check if already a member
    if (members.some((m: any) => m.userId === user.id)) {
      return c.json({ error: 'You are already a member of this community' }, 400);
    }

    members.push({
      userId: user.id,
      name: user.user_metadata?.name || 'Member',
      email: user.email,
      role: 'resident',
      joinedAt: new Date().toISOString()
    });

    await kv.set(`community:${communityId}:members`, members);

    // Update member count
    community.memberCount = members.length;
    await kv.set(`community:${communityId}`, community);

    // Update user profile
    const userProfile = await kv.get(`user:${user.id}`) || {};
    userProfile.role = 'resident';
    userProfile.communityId = communityId;
    await kv.set(`user:${user.id}`, userProfile);

    // Mark code as used
    codeData.used = true;
    codeData.usedBy = user.id;
    codeData.usedAt = new Date().toISOString();
    await kv.set(`joincode:${joinCode}`, codeData);

    return c.json({ 
      success: true,
      community,
      message: 'Successfully joined community'
    });
  } catch (error) {
    console.log('Error joining community:', error);
    return c.json({ error: 'Internal server error while joining community' }, 500);
  }
});

// Get user's community
app.get("/make-server-85e399fd/communities/my-community", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile || !userProfile.communityId) {
      return c.json({ community: null, role: 'none' });
    }

    const community = await kv.get(`community:${userProfile.communityId}`);
    const members = await kv.get(`community:${userProfile.communityId}:members`) || [];

    return c.json({ 
      community,
      role: userProfile.role,
      memberCount: members.length
    });
  } catch (error) {
    console.log('Error fetching user community:', error);
    return c.json({ error: 'Internal server error while fetching community' }, 500);
  }
});

// Get community members (authenticated users only)
app.get("/make-server-85e399fd/communities/:communityId/members", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const communityId = c.req.param('communityId');
    const userProfile = await kv.get(`user:${user.id}`);

    // Verify user is member of this community
    if (!userProfile || userProfile.communityId !== communityId) {
      return c.json({ error: 'You are not a member of this community' }, 403);
    }

    const members = await kv.get(`community:${communityId}:members`) || [];

    return c.json({ members });
  } catch (error) {
    console.log('Error fetching community members:', error);
    return c.json({ error: 'Internal server error while fetching members' }, 500);
  }
});

// ====== OWNER ANNOUNCEMENTS ======

// Create owner announcement
app.post("/make-server-85e399fd/communities/:communityId/announcements", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const communityId = c.req.param('communityId');
    const community = await kv.get(`community:${communityId}`);

    if (!community) {
      return c.json({ error: 'Community not found' }, 404);
    }

    // Verify user is owner
    if (community.ownerId !== user.id) {
      return c.json({ error: 'Only community owner can create announcements' }, 403);
    }

    const { title, message, priority = 'normal' } = await c.req.json();

    if (!title || !message) {
      return c.json({ error: 'Title and message are required' }, 400);
    }

    const announcements = await kv.get(`community:${communityId}:announcements`) || [];
    
    const announcement = {
      id: `announcement_${Date.now()}`,
      title,
      message,
      priority, // normal, important, urgent
      createdBy: user.id,
      createdByName: user.user_metadata?.name || 'Owner',
      createdAt: new Date().toISOString()
    };

    announcements.unshift(announcement);
    
    // Keep only last 50 announcements
    if (announcements.length > 50) {
      announcements.length = 50;
    }

    await kv.set(`community:${communityId}:announcements`, announcements);

    return c.json({ 
      success: true,
      announcement
    });
  } catch (error) {
    console.log('Error creating announcement:', error);
    return c.json({ error: 'Internal server error while creating announcement' }, 500);
  }
});

// Get community announcements
app.get("/make-server-85e399fd/communities/:communityId/announcements", async (c) => {
  const { error, user } = await verifyUser(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const communityId = c.req.param('communityId');
    const userProfile = await kv.get(`user:${user.id}`);

    // Verify user is member of this community
    if (!userProfile || userProfile.communityId !== communityId) {
      return c.json({ error: 'You are not a member of this community' }, 403);
    }

    const announcements = await kv.get(`community:${communityId}:announcements`) || [];

    return c.json({ announcements });
  } catch (error) {
    console.log('Error fetching announcements:', error);
    return c.json({ error: 'Internal server error while fetching announcements' }, 500);
  }
});

Deno.serve(app.fetch);