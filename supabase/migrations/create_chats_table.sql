-- Create chats table for storing chat messages
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all chats" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_2024 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'employee')
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id_created_at ON chats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC);