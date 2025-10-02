import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "../components/login-form"
import { motion } from "framer-motion"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2 text-xs sm:text-sm md:text-base bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
      <motion.div 
        className="flex flex-col gap-4 p-4 sm:p-6 md:p-10"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="flex justify-center gap-2">
          <a href="#" className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-white">
              <GalleryVerticalEnd className="size-10 sm:size-12"/>
            </div>
            Talent Flow
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <motion.div 
            className="rounded-lg shadow-xl max-w-[95%] sm:max-w-[75%] flex flex-1 items-center justify-center h-full bg-white/80 backdrop-blur-sm p-2 sm:p-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
          >
            <div className="w-full max-w-xs text-xs sm:text-sm md:text-base">
              <LoginForm />
            </div>
          </motion.div>
        </div>
      </motion.div>
      <div className="relative hidden bg-muted lg:block ">
        <motion.img
          src="src/assets/login_cover_v1.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <motion.div 
          className="absolute bottom-10 left-10 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
        >
          <h2 className="text-4xl font-bold">Find your next great hire</h2>
          <p className="text-lg mt-2">The all-in-one platform for modern recruiting</p>
        </motion.div>
      </div>
    </div>
  )
}
