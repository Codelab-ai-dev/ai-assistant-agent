"use server"

import { botSchema, SuccessSchema } from "../src/schemas"

type ActionStateType = {
    errors: string[]
    success: string
}

// Almacena las solicitudes en memoria
const requests = new Map<string, { count: number; lastRequest: number }>();

const RATE_LIMIT = 5; // Máximo de 5 solicitudes
const TIME_WINDOW = 60 * 1000; // 1 minuto en milisegundos

export async function bot(prevState: ActionStateType, formData: FormData) {
    const message = formData.get("message");

    // Validar la entrada
    const validation = botSchema.safeParse({ message });
    if (!validation.success) {
        const errors = validation.error.errors.map((error) => error.message);
        return { errors, success: prevState.success };
    }

    // Obtener la IP del usuario (esto no siempre es confiable en Server Actions)
    const userId = "unknown"; // No hay IP en Server Actions, se puede usar un identificador único si lo tienes

    // Rate Limiting
    const now = Date.now();
    const userRequest = requests.get(userId) || { count: 0, lastRequest: now };

    if (now - userRequest.lastRequest > TIME_WINDOW) {
        userRequest.count = 0; // Reinicia el contador si pasó el tiempo
    }

    if (userRequest.count >= RATE_LIMIT) {
        return { errors: ["Demasiadas solicitudes. Intenta nuevamente en un minuto."], success: prevState.success };
    }

    userRequest.count++;
    userRequest.lastRequest = now;
    requests.set(userId, userRequest);

    // Llamar al webhook de N8N
    const url = `${process.env.N8N_URL}/webhook/ask-agent`;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ message: validation.data.message }),
    });

    const data = await response.text();
    const parsedData = JSON.parse(data);
    const plainText = parsedData[0]?.output || "";

    const success = SuccessSchema.parse(plainText);

    return { errors: prevState.errors, success };
}