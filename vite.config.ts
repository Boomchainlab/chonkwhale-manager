import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_TEST_API_KEY': 'import.meta.env.VITE_PUBLISHABLE_KEY',
  },
  // /** rest of code here **/
})
