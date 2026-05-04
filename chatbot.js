/**
 * Chatbot IA - 180° Software Estudio (Sitio Principal)
 * Motor: Gemini 2.0 Flash con fallback inteligente
 */

// ============================================
// CONFIGURACIÓN DE IA (GEMINI)
// ============================================

const GEMINI_API_KEY = "AIzaSyBK_eiodE_Q3rO5kS68287VGTDYJLgnX-g";
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest"
];
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// ============================================
// SYSTEM PROMPT - Sitio Principal
// ============================================

const SYSTEM_PROMPT = `
Eres el asistente virtual de 180° Software Estudio, parte del Grupo Empresarial 180°.

Tu PROPÓSITO: Ayudar a visitantes del sitio a conocer los servicios, metodología y contactar al equipo.

INFORMACIÓN CLAVE:
- Empresa: 180° Software Estudio / Grupo Empresarial 180°
- Slogan: "Transformamos ideas en resultados, creatividad en innovación y proyectos en negocios exitosos."
- Email: hola@180softwareestudio.com
- Teléfono: +57 300 000 0000
- Ubicación: Soacha, Bogotá - Colombia

SERVICIOS PRINCIPALES:
1. Desarrollo web corporativo: Sitios institucionales, ecommerce y plataformas digitales.
2. Apps móviles: Aplicaciones nativas e híbridas diseñadas para usuarios y resultados.
3. Software empresarial a medida: CRM, ERP y portales internos.
4. UX/UI y diseño digital: Experiencias visuales claras y accesibles.
5. IA y automatización: Integración inteligente para mejorar productividad.

UNIDADES DE NEGOCIO DEL GRUPO:
- 180° Agencia Digital: Marketing digital, redes sociales, contenido multimedia.
- 180° Software Studio: Desarrollo de software avanzado, IA y automatización.

METODOLOGÍA (5 pasos): Diagnóstico → Estrategia → Diseño → Desarrollo → Lanzamiento

VISIÓN: Ser el estudio tecnológico de referencia en Soacha y Bogotá, con impacto internacional para 2030.

### REGLAS DE COMPORTAMIENTO

1. TONO: Profesional pero cercano, motivador y confiable. Usa emojis con moderación.
2. BREVEDAD: Máximo 3-4 párrafos por respuesta.
3. CONVERSIÓN: Siempre guía hacia contacto o cotización cuando sea apropiado.
4. SERVICIOS: Si preguntan por marketing/publicidad, menciona 180° Agencia Digital. Si preguntan por tech avanzado/IA, menciona 180° Software Studio.
5. COTIZACIÓN: Pide el tipo de proyecto y redirige al email hola@180softwareestudio.com.
6. NO TE DESVÍES: Si preguntan algo no relacionado con la empresa, redirige amablemente.

Responde siempre en español, de forma concisa y directa.
`;

// ============================================
// RESPUESTAS FALLBACK INTELIGENTES
// ============================================

const FALLBACK_RESPONSES = {
  servicios: `¡Con gusto te cuento! 🚀 En **180° Software Estudio** ofrecemos:

**1. Desarrollo Web Corporativo** – Sitios institucionales, ecommerce y plataformas digitales de alto impacto.

**2. Apps Móviles** – Aplicaciones nativas e híbridas para iOS y Android, diseñadas para resultados.

**3. Software Empresarial** – CRM, ERP y portales internos que optimizan tus operaciones.

**4. UX/UI y Diseño Digital** – Experiencias visuales claras, accesibles y orientadas a conversión.

**5. IA y Automatización** – Integración inteligente para mejorar productividad y toma de decisiones.

¿Hay algún servicio que te interese explorar más? 😊`,

  contacto: `¡Perfecto! Nos encantaría conocer tu proyecto. 📩

**Email:** hola@180softwareestudio.com
**Teléfono:** +57 300 000 0000
**Ubicación:** Soacha, Bogotá - Colombia

Puedes escribirnos o llamarnos directamente. Nuestro equipo responde en menos de 24 horas. ¿Tienes ya en mente qué tipo de proyecto necesitas?`,

  cotizacion: `¡Gracias por tu interés! 💡 Para prepararte una cotización precisa, necesitamos conocer algunos detalles:

• ¿Qué tipo de proyecto tienes en mente? (web, app, software empresarial, etc.)
• ¿Cuál es el alcance aproximado?
• ¿Tienes un plazo definido?

Escríbenos a **hola@180softwareestudio.com** o llámanos al **+57 300 000 0000**. ¡Nos contactamos en menos de 24 horas!`,

  quienes: `Somos **Grupo Empresarial 180°**, un conglomerado innovador que integra creatividad, tecnología e inversión estratégica. 🌟

*"Transformamos ideas en resultados, creatividad en innovación y proyectos en negocios exitosos."*

Contamos con dos unidades especializadas:
- **180° Agencia Digital** – Marketing y estrategia de marca
- **180° Software Studio** – Desarrollo tecnológico avanzado e IA

¿Qué puedo contarte sobre nuestro trabajo?`,

  default: `¡Hola! 👋 Estoy aquí para ayudarte a encontrar la solución perfecta para tu negocio.

En **180° Software Estudio** transformamos ideas en software funcional y productos digitales que generan resultados reales.

Puedo ayudarte con información sobre:
- Nuestros servicios de desarrollo
- Cómo solicitar una cotización
- Cómo contactar a nuestro equipo

¿Sobre qué te gustaría saber más?`
};

function getFallbackResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('servicio') || lower.includes('ofrecen') || lower.includes('hacen') || lower.includes('ofrecéis')) {
    return FALLBACK_RESPONSES.servicios;
  }
  if (lower.includes('contact') || lower.includes('hablar') || lower.includes('llamar') || lower.includes('email') || lower.includes('correo')) {
    return FALLBACK_RESPONSES.contacto;
  }
  if (lower.includes('cotiz') || lower.includes('presupuesto') || lower.includes('costo') || lower.includes('precio')) {
    return FALLBACK_RESPONSES.cotizacion;
  }
  if (lower.includes('quién') || lower.includes('quienes') || lower.includes('empresa') || lower.includes('sobre')) {
    return FALLBACK_RESPONSES.quienes;
  }
  return FALLBACK_RESPONSES.default;
}

// ============================================
// MOTOR CONVERSACIONAL CON IA (GEMINI)
// ============================================

class ChatbotIA {
  constructor() {
    this.widget = document.getElementById('chatbot-widget');
    this.toggle = document.getElementById('chatbot-toggle');
    this.window = document.getElementById('chatbot-window');
    this.close = document.getElementById('chatbot-close');
    this.messages = document.getElementById('chatbot-messages');
    this.input = document.getElementById('chatbot-input');
    this.send = document.getElementById('chatbot-send');

    if (!this.validateElements()) {
      console.error('Error: No se encontraron todos los elementos del chatbot en el DOM');
      return;
    }

    this.isTyping = false;
    this.conversationHistory = [];

    this.init();
    console.log('✓ Chatbot IA inicializado correctamente');
  }

  validateElements() {
    return this.widget && this.toggle && this.window && this.close && this.messages && this.input && this.send;
  }

  init() {
    this.toggle.addEventListener('click', () => this.toggleChat());
    this.close.addEventListener('click', () => this.closeChat());
    this.send.addEventListener('click', () => this.handleUserInput());

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserInput();
      }
    });

    // Botones de acciones rápidas iniciales
    this.messages.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        const queries = {
          servicios: "¿Cuáles son los servicios que ofrecen?",
          contacto: "Quiero contactarles para una consulta",
          cotizacion: "¿Cómo puedo solicitar una cotización?"
        };
        if (queries[query]) {
          this.addMessage(queries[query], 'user');
          this.conversationHistory.push({ role: 'user', parts: [{ text: queries[query] }] });
          this.getGeminiResponse(queries[query]);
        }
      });
    });
  }

  toggleChat() {
    this.window.classList.toggle('is-open');
    if (this.window.classList.contains('is-open')) {
      this.input.focus();
    }
  }

  closeChat() {
    this.window.classList.remove('is-open');
  }

  handleUserInput() {
    const text = this.input.value.trim();
    if (!text || this.isTyping) return;

    this.addMessage(text, 'user');
    this.input.value = '';

    this.conversationHistory.push({ role: 'user', parts: [{ text }] });
    this.getGeminiResponse(text);
  }

  async tryGeminiModel(modelName) {
    const url = `${GEMINI_BASE_URL}/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: "Entendido. Soy el asistente de 180° Software Estudio. Seguiré las instrucciones y estoy listo para ayudar." }] },
      ...this.conversationHistory
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw Object.assign(new Error(`API Error: ${response.status}`), { status: response.status, data: errorData });
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async getGeminiResponse(userMessage) {
    this.isTyping = true;
    this.send.disabled = true;
    this.addTypingIndicator();

    let botResponse = null;

    // Intentar con cada modelo disponible
    for (const model of GEMINI_MODELS) {
      try {
        botResponse = await this.tryGeminiModel(model);
        console.log(`✓ Respuesta obtenida con modelo: ${model}`);
        break;
      } catch (error) {
        console.warn(`✗ Falló modelo ${model}: ${error.message}`);
        if (error.status === 429) {
          // Rate limit - esperar 2s antes del siguiente modelo
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    this.removeTypingIndicator();

    if (botResponse) {
      this.conversationHistory.push({ role: 'model', parts: [{ text: botResponse }] });
      this.addMessage(botResponse, 'bot');
    } else {
      // Usar respuesta predefinida inteligente
      const fallback = getFallbackResponse(userMessage);
      this.conversationHistory.push({ role: 'model', parts: [{ text: fallback }] });
      this.addMessage(fallback, 'bot');
    }

    this.isTyping = false;
    this.send.disabled = false;
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    let parsedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    parsedContent = parsedContent.replace(/\n/g, '<br>');
    messageDiv.innerHTML = `<div class="message-content">${parsedContent}</div>`;
    this.messages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addTypingIndicator() {
    if (this.messages.querySelector('.typing-message')) return;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot typing-message';
    typingDiv.innerHTML = `<div class="message-content typing-indicator"><span></span><span></span><span></span></div>`;
    this.messages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const typing = this.messages.querySelector('.typing-message');
    if (typing) typing.remove();
  }

  scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight;
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================
function initializeChatbot() {
  try {
    window.chatbot = new ChatbotIA();
    console.log('✓ Chatbot inicializado exitosamente');
  } catch (error) {
    console.error('✗ Error al inicializar chatbot:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
  initializeChatbot();
}