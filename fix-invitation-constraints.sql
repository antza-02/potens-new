-- =====================================================
-- FIX INVITATION STATUS CONSTRAINTS
-- =====================================================

-- Step 1: Check current constraints
SELECT '=== CURRENT CONSTRAINTS ===' as section;
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'user_invitations'::regclass
ORDER BY contype, conname;

-- Step 2: Drop the existing status check constraint
ALTER TABLE user_invitations DROP CONSTRAINT IF EXISTS user_invitations_status_check;

-- Step 3: Create a new constraint that allows all the status values we need
ALTER TABLE user_invitations ADD CONSTRAINT user_invitations_status_check 
CHECK (status IN (
  'pending',           -- Just created
  'invitation_created', -- Successfully saved
  'invitation_resent',  -- Marked as resent
  'email_sent',        -- Email was sent (for future use)
  'email_resent',      -- Email was resent (for future use)
  'accepted',          -- User accepted invitation (for future use)
  'expired',           -- Invitation expired (for future use)
  'cancelled'          -- Cancelled by admin
));

-- Step 4: Verify the new constraint
SELECT '=== NEW CONSTRAINT ===' as section;
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'user_invitations_status_check';

-- Step 5: Test inserting with different status values
SELECT '=== TESTING STATUS VALUES ===' as section;

-- Test 1: pending
INSERT INTO user_invitations (email, full_name, role, invited_by, status, invitation_token, expires_at)
VALUES ('test1@example.com', 'Test User 1', 'user', (SELECT id FROM profiles LIMIT 1), 'pending', 'test-token-1', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Test 2: invitation_created
INSERT INTO user_invitations (email, full_name, role, invited_by, status, invitation_token, expires_at)
VALUES ('test2@example.com', 'Test User 2', 'user', (SELECT id FROM profiles LIMIT 1), 'invitation_created', 'test-token-2', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Test 3: invitation_resent
INSERT INTO user_invitations (email, full_name, role, invited_by, status, invitation_token, expires_at)
VALUES ('test3@example.com', 'Test User 3', 'user', (SELECT id FROM profiles LIMIT 1), 'invitation_resent', 'test-token-3', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Test 4: cancelled
INSERT INTO user_invitations (email, full_name, role, invited_by, status, invitation_token, expires_at)
VALUES ('test4@example.com', 'Test User 4', 'user', (SELECT id FROM profiles LIMIT 1), 'cancelled', 'test-token-4', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Step 6: Show test results
SELECT '=== TEST RESULTS ===' as section;
SELECT 
  email,
  status,
  created_at
FROM user_invitations 
WHERE email LIKE 'test%@example.com'
ORDER BY email;

-- Step 7: Clean up test data
DELETE FROM user_invitations WHERE email LIKE 'test%@example.com';

-- Step 8: Show final constraint status
SELECT '=== FINAL CONSTRAINT STATUS ===' as section;
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'user_invitations'::regclass
ORDER BY contype, conname;
