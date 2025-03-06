import { z } from "zod"

export const botSchema = z.object({
  message: z.string().min(1, { message: "El campo no puede ir vacio" }),
})

export const SuccessSchema = z.string().min(1, { message: "El campo no puede ir vacio" })