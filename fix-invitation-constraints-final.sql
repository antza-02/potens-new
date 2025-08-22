-- =====================================================
-- FIX INVITATION STATUS CONSTRAINTS - FINAL VERSION
-- =====================================================

-- Based on the actual constraint found:
-- CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text])))

-- Step 1: Drop the existing status check constraint
ALTER TABLE user_invitations DROP CONSTRAINT IF EXISTS user_invitations_status_check;

-- Step 2: Create a new constraint that allows all the status values we need
ALTER TABLE user_invitations ADD CONSTRAINT user_invitations_status_check 
CHECK (status = ANY (ARRAY[
  'pending',           -- Just created (default)
  'invitation_created', -- Successfully saved to database
  'invitation_resent',  -- Marked as resent
  'email_sent',        -- Email was sent (for future use)
  'email_resent',      -- Email was resent (for future use)
  'accepted',          -- User accepted invitation
  'expired',           -- Invitation expired
  'cancelled'          -- Cancelled by admin
]));

-- Step 3: Verify the new constraint
SELECT '=== NEW CONSTRAINT ===' as section;
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'user_invitations_status_check';

-- Step 4: Test the new constraint with our status values
SELECT '=== TESTING NEW STATUS VALUES ===' as section;

-- Test 1: invitation_created (this was failing before)
INSERT INTO user_invitations (email, full_name, role, invited_by, status, invitation_token, expires_at)
VALUES ('test1@example.com', 'Test User 1', 'user', (SELECT id FROM profiles LIMIT 1), 'invitation_created', 'test-token-1', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Test 2: invitation_resent (this was failing before)
INSERT INTO user_invitations (email, full_name, role, invited_by, status, invitation_token, expires_at)
VALUES ('test2@example.com', 'Test User 2', 'user', (SELECT id FROM profiles LIMIT 1), 'invitation_resent', 'test-token-2', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Test 3: cancelled (this was failing before)
INSERT INTO user_invitations (email, full_name, role, invited_by, status, invitation_token, expires_at)
VALUES ('test3@example.com', 'Test User 3', 'user', (SELECT id FROM profiles LIMIT 1), 'cancelled', 'test-token-3', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Step 5: Show test results
SELECT '=== TEST RESULTS ===' as section;
SELECT 
  email,
  status,
  created_at
FROM user_invitations 
WHERE email LIKE 'test%@example.com'
ORDER BY email;

-- Step 6: Clean up test data
DELETE FROM user_invitations WHERE email LIKE 'test%@example.com';

-- Step 7: Show final constraint status
SELECT '=== FINAL CONSTRAINT STATUS ===' as section;
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'user_invitations'::regclass
ORDER BY contype, conname;

-- Step 8: Show all allowed status values
SELECT '=== ALLOWED STATUS VALUES ===' as section;
SELECT unnest(ARRAY[
  'pending',
  'invitation_created', 
  'invitation_resent',
  'email_sent',
  'email_resent',
  'accepted',
  'expired',
  'cancelled'
]) as allowed_status;
