import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xoihnmkgncuocikmgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaWhubWtnbmN1b2N4aWtudmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTAwNzgsImV4cCI6MjA5NjUyNjA3OH0.NQBD6pAMHkz-PMtd7sKzOeiWUDfL4MnNJU6AThQAL64'
)
