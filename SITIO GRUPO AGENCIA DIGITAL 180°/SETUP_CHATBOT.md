# Configuración del Chatbot IA - Grupo Empresarial 180°

## ⚠️ URGENTE: Tu API Key fue comprometida

La API key de OpenAI estaba **públicamente visible** en el código. Debes:

1. **Regenerar la API key INMEDIATAMENTE** en https://platform.openai.com/account/api-keys
2. Reemplazar la antigua key en el código
3. Monitorear el uso de tu cuenta OpenAI para detectar abuso

---

## Soluciones Implementadas

### 1. **Reintentos Inteligentes para Rate Limiting**
- Ahora el chatbot intenta automáticamente hasta 3 veces si recibe error 429 (rate limit)
- Usa backoff exponencial: espera 1s → 2s → 4s entre reintentos
- El usuario verá un mensaje informando que está reintentando

### 2. **Control de Velocidad (Throttle)**
- Espera mínimo 1 segundo entre solicitudes
- Evita sobrecargar la API de OpenAI
- Previene spike de múltiples solicitudes rápidas

### 3. **Mejor Manejo de Errores**
- Diferencia entre errores de autenticación, rate limit y problemas del servidor
- Fallback a respuestas predefinidas cuando la IA no está disponible
- Mensajes claros al usuario sobre qué está sucediendo

### 4. **Respuestas Fallback Mejoras**
- El chatbot puede responder sin IA si es necesario
- Usa información predefinida sobre servicios, contacto, cotizaciones, etc.

---

## Pasos para Configurar

### Paso 1: Regenerar API Key en OpenAI
1. Ve a https://platform.openai.com/account/api-keys
2. **Elimina** la API key antigua (la que estaba en el código)
3. Click en "+ Create new secret key"
4. Copia la nueva key (solo se muestra una vez)

### Paso 2: Actualizar la Configuración

#### Opción A: Desarrollo Local (Rápido)
Edita `chatbot.js` línea ~117:
```javascript
const OPENAI_API_KEY = "sk-proj-TUANUEVAAPIKEYAQUÍ";
```

#### Opción B: Producción Segura (Recomendado)
Para no exponer la API key, crea un backend:

**Node.js/Express ejemplo:**
```javascript
const express = require('express');
const app = express();

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: history,
      max_tokens: 500
    })
  });
  
  const data = await response.json();
  res.json(data);
});

app.listen(3000);
```

Luego actualiza `chatbot.js` para llamar a tu backend en lugar de OpenAI directamente.

### Paso 3: Verificar Funcionamiento

1. Abre el sitio en el navegador
2. Haz click en el botón del chatbot (icono dorado)
3. Prueba las acciones rápidas:
   - "¿Qué servicios ofrecen?"
   - "Quiero contactarles"
   - "Solicitar cotización"
4. Escribe un mensaje personalizado

Si ves un error de rate limit:
- El chatbot reintentará automáticamente
- Si persiste, probablemente hayas alcanzado tu límite mensual de OpenAI

---

## Límites de OpenAI

### Plan Gratuito
- **$5 crédito inicial** (válido 3 meses)
- Sin acceso a modelos nuevos
- Límite de rate: 3 requests/minuto, 200k tokens/minuto

### Plan de Pago
- Paga por tokens consumidos (~$0.003 por 1K tokens)
- Límites más altos según tu facturación

Para ver tu uso: https://platform.openai.com/usage/overview

---

## Mejores Prácticas

1. **Nunca commits la API key en Git**
   - Usa `.env` y `.gitignore`
   - Usa variables de entorno

2. **Monitorea tu uso de OpenAI**
   - Activa alertas si se acerca a tu límite
   - Revisa logs regularmente

3. **Usa fallback responses**
   - El chatbot ya tiene respuestas predefinidas
   - Aún funciona si OpenAI cae

4. **Limita concurrencia**
   - Throttle (1s entre requests) ya está implementado
   - Aumenta si necesitas mayor capacidad

---

## Preguntas Frecuentes

**P: ¿Por qué aparece el error de rate limit?**
R: Has enviado demasiadas solicitudes en poco tiempo. El chatbot ahora reintenta automáticamente 3 veces.

**P: ¿Se ve mi API key en el navegador?**
R: Sí, por eso es INSEGURO. Para producción, debes usar un backend que intermedie las llamadas.

**P: ¿Cuánto me cuesta esto?**
R: Los modelos de OpenAI son baratos (~$0.003 por 1K tokens). Depende de tu uso.

**P: ¿Qué hago si no aparece respuesta?**
R: Revisa la consola del navegador (F12) para ver errores. Verifica que la API key sea correcta.

---

## Contáctame si necesitas ayuda
Para soporte adicional o configuración de backend seguro, contacta a tu desarrollador.
