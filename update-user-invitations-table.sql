-- =====================================================
-- UPDATE USER INVITATIONS TABLE - Add invitation token and improve structure
-- =====================================================

-- Step 1: Add invitation_token column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_invitations' 
        AND column_name = 'invitation_token'
    ) THEN
        ALTER TABLE user_invitations ADD COLUMN invitation_token TEXT UNIQUE;
        RAISE NOTICE 'Added invitation_token column to user_invitations table';
    ELSE
        RAISE NOTICE 'invitation_token column already exists';
    END IF;
END $$;

-- Step 2: Add expires_at column for invitation expiration
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_invitations' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE user_invitations ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days');
        RAISE NOTICE 'Added expires_at column to user_invitations table';
    ELSE
        RAISE NOTICE 'expires_at column already exists';
    END IF;
END $$;

-- Step 3: Update existing invitations to have tokens and expiration dates
UPDATE user_invitations 
SET 
  invitation_token = 'inv_' || id || '_' || EXTRACT(EPOCH FROM NOW())::text,
  expires_at = NOW() + INTERVAL '7 days'
WHERE invitation_token IS NULL;

-- Step 4: Create index on invitation_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);

-- Step 5: Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);

-- Step 6: Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);

-- Step 7: Add constraint to ensure invitation_token is not null for new invitations
ALTER TABLE user_invitations ALTER COLUMN invitation_token SET NOT NULL;

-- Step 8: Verify the updated table structure
SELECT '=== UPDATED USER_INVITATIONS TABLE STRUCTURE ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_invitations'
ORDER BY ordinal_position;

-- Step 9: Show sample invitations with tokens
SELECT '=== SAMPLE INVITATIONS WITH TOKENS ===' as section;
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  invitation_token,
  expires_at,
  created_at
FROM user_invitations
ORDER BY created_at DESC
LIMIT 5;
