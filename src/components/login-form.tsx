/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { motion } from "framer-motion";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/jobs");
  };

  return (
    <motion.form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Login to your account
        </h1>
        <p className="text-gray-500 text-sm text-balance">
          Enter your email and password to access your dashboard
        </p>
      </div>
      <div className="grid gap-6">
        <motion.div
          className="grid gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Label htmlFor="email" className="text-gray-600">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-white/50"
          />
        </motion.div>
        <motion.div
          className="grid gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <div className="flex items-center">
            <Label htmlFor="password" className="text-gray-600">
              Password
            </Label>
            <a
              href="#"
              className="ml-auto text-sm text-[#3B82F6] hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-white/50"
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white hover:shadow-lg border-0 shadow-md cursor-pointer"
            onClick={handleSubmit}
          >
            Login
          </Button>
        </motion.div>
      </div>
    </motion.form>
  );
}
