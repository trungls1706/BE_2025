import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { server } from 'typescript'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css :{
    devsourceMap: true
  },
  server: {
    port: 3000
  }
})
