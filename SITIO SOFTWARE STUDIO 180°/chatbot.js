/**
 * Chatbot IA de Alta Conversión - 180° Software Studio
 * v4.1 - System Prompt Reforzado para Evitar Deriva del Modelo
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
// EL CEREBRO DEL BOT: EL SYSTEM PROMPT (VERSIÓN STUDIO v4.1)
// ============================================

const SYSTEM_PROMPT = `
Eres el Asistente IA de 180° Software Studio. Tu identidad es una fusión de El Mago (visionario técnico) y el Héroe (ejecutor impecable de código).

Tu PROPÓSITO: "Transformar ideas en código, y código en futuro".

--- 
### REGLAS INQUEBRANTABLES

1.  **TU ÚNICA FUNCIÓN ES CUALIFICAR Y CONVERTIR.** No eres un profesor de programación ni un solucionador de problemas técnicos gratuito. Tu objetivo es determinar si un usuario es un cliente potencial para un proyecto de desarrollo o para una posición de talento.

2.  **FLUJO #1 (PROYECTO):** Si el usuario quiere construir, crear o mejorar software/apps/IA, tu guion es: 1) Diagnostica la etapa del proyecto (idea, mejora, etc.). 2) Entiende el desafío técnico (escalabilidad, IA, etc.). 3) Cierra ofreciendo un **"Análisis Técnico" gratuito** y pide el email para agendar la sesión de diagnóstico. No te desvíes.

3.  **FLUJO #2 (TALENTO):** Si el usuario busca desarrolladores, expertos o perfiles tech, tu guion es: 1) Identifica el rol que necesita (Frontend, IA, etc.). 2) Determina la duración. 3) Cierra ofreciendo una **llamada rápida de 15 minutos** y pide el WhatsApp para coordinarla. No te desvíes.

4.  **MANEJO DE PRECIOS:** Si preguntan por costos, la única respuesta permitida es: "El costo de un proyecto de software depende totalmente de su alcance. El primer paso es siempre un 'Análisis Técnico' gratuito para definirlo y darte un presupuesto preciso. ¿Agendamos tu sesión?". No des cifras ni estimaciones.

5.  **CÍÑETE AL PROYECTO:** No escribas código, no depures errores, no des tutoriales. Responde cualquier pregunta técnica desde la perspectiva de cómo **180° Software Studio** abordaría ese problema en un proyecto real, y úsalo como un puente para volver a uno de los flujos de conversión. Eres un arquitecto de soluciones, no un programador por hora.

--- 
Tu primera respuesta SIEMPRE debe ser: "¡Hola! 👋 Soy el asistente IA de **180° Software Studio**. Vemos el código como el futuro de los negocios.\n\n¿Qué te trae por aquí?"
`;

// ============================================
// MOTOR CONVERSACIONAL CON IA (GEMINI) - Reutilizable
// ============================================

class ChatbotWithGemini {
  constructor() {
    this.widget = document.getElementById('chatbot-widget');
    this.toggle = document.getElementById('chatbot-toggle');
    this.window = document.getElementById('chatbot-window');
    this.close = document.getElementById('chatbot-close');
    this.messages = document.getElementById('chatbot-messages');
    this.input = document.getElementById('chatbot-input');
    this.send = document.getElementById('chatbot-send');
    this.quickActionsContainer = this.window.querySelector('.quick-actions');

    if (!this.validateElements()) {
      console.error("Error: Faltan elementos clave del chatbot en el DOM.");
      return;
    }
    this.init();
  }

  validateElements() {
    return this.widget && this.toggle && this.window && this.close && this.messages && this.input && this.send && this.quickActionsContainer;
  }

  init() {
    this.isTyping = false;
    this.conversationHistory = [];

    this.toggle.addEventListener('click', () => this.toggleChat());
    this.close.addEventListener('click', () => this.closeChat());
    this.send.addEventListener('click', () => this.handleUserInput());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserInput();
      }
    });
    this.resetConversation();
  }

  resetConversation() {
    this.messages.innerHTML = '';
    this.conversationHistory = [];
    this.addMessage("¡Hola! 👋 Soy el asistente IA de **180° Software Studio**. Vemos el código como el futuro de los negocios.\n\n¿Qué te trae por aquí?", 'bot');
    this.renderOptions([
        { text: "Quiero iniciar un proyecto" },
        { text: "Necesito talento tech" },
        { text: "Solo estoy explorando" },
    ]);
  }

  toggleChat() {
    this.window.classList.toggle('is-open');
    if (this.window.classList.contains('is-open')) {
        this.input.focus();
    } else {
        setTimeout(() => this.resetConversation(), 400);
    }
  }

  closeChat() {
    this.window.classList.remove('is-open');
    setTimeout(() => this.resetConversation(), 400);
  }

  handleUserInput(predefinedText = null) {
    const text = predefinedText || this.input.value.trim();
    if (!text || this.isTyping) return;

    this.addMessage(text, 'user');
    this.input.value = '';
    this.quickActionsContainer.innerHTML = '';
    
    this.conversationHistory.push({ role: 'user', parts: [{ text }] });
    this.getGeminiResponse();
  }

  async tryGeminiModel(modelName) {
    const url = `${GEMINI_BASE_URL}/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: "Entendido. Soy el Asistente IA de 180° Software Studio. Mi función es cualificar y convertir siguiendo tus REGLAS INQUEBRANTABLES. Estoy listo." }] },
      ...this.conversationHistory
    ];
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, safetySettings: [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ] }),
    });
    if (!response.ok) {
      throw Object.assign(new Error(`API Error: ${response.status}`), { status: response.status });
    }
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async getGeminiResponse() {
    this.isTyping = true;
    this.addTypingIndicator();

    let botResponse = null;
    for (const model of GEMINI_MODELS) {
      try {
        botResponse = await this.tryGeminiModel(model);
        console.log(`✓ Respuesta obtenida con modelo: ${model}`);
        break;
      } catch (error) {
        console.warn(`✗ Falló modelo ${model}: ${error.message}`);
        if (error.status === 429) await new Promise(r => setTimeout(r, 2000));
      }
    }

    this.conversationHistory.push({ role: 'model', parts: [{ text: botResponse || "Lo siento, no puedo conectarme ahora. Por favor, contáctanos directamente." }] });
    this.addMessage(botResponse || "Lo siento, estoy con alta demanda en este momento. ¿Te puedo ayudar con información básica sobre nuestros servicios?", 'bot');

    this.isTyping = false;
    this.removeTypingIndicator();
  }

  renderOptions(options) {
    this.quickActionsContainer.innerHTML = '';
    options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'quick-action';
      btn.textContent = option.text;
      btn.onclick = () => this.handleUserInput(option.text);
      this.quickActionsContainer.appendChild(btn);
    });
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
    window.chatbotV4 = new ChatbotWithGemini();
    console.log('✓ Chatbot de Studio v4.1 (PROMPT REFORZADO) inicializado.');
  } catch (error) {
    console.error('✗ Error al inicializar el Chatbot v4.1:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
  initializeChatbot();
}
