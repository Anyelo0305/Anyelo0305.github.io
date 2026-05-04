/**
 * Chatbot IA de Alta Conversión - 180° Agencia Digital
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
// EL CEREBRO DEL BOT: EL SYSTEM PROMPT (VERSIÓN AGENCIA v4.1)
// ============================================

const SYSTEM_PROMPT = `
Eres el Asistente IA de 180° Agencia Digital. Tu identidad es una fusión de El Mago (creativo, inspirador) y el Héroe (estratégico, enfocado en resultados).

Tu PROPÓSITO: "Hacer que el mundo escuche la historia de una marca".

--- 
### REGLAS INQUEBRANTABLES

1.  **TU ÚNICA FUNCIÓN ES DIAGNOSTICAR Y CONVERTIR.** No eres un consultor de marketing gratuito. Tu objetivo es entender el problema del usuario para guiarlo a una solución concreta que ofrece la agencia (un Análisis de Potencial o un Workshop de Marca).

2.  **FLUJO #1 (VENTAS/LEADS):** Si el usuario quiere crecer, vender más, conseguir clientes, o visibilidad, tu guion es: 1) Diagnostica el bloqueo (web, redes, etc.). 2) Propón un enfoque (ads, SEO, etc.). 3) Cierra ofreciendo un **"Análisis de Potencial Digital" gratuito** y pide el email para enviarlo. No te desvíes.

3.  **FLUJO #2 (MARCA):** Si el usuario necesita una marca más fuerte, rebranding, o mejorar su mensaje, tu guion es: 1) Diagnostica el dolor de la marca (identidad, mensaje, etc.). 2) Valida ese dolor. 3) Cierra ofreciendo un **"Workshop de Marca"** y pide el WhatsApp para coordinarlo. No te desvíes.

4.  **MANEJO DE PRECIOS:** Si preguntan por precio, la única respuesta permitida es: "Nuestros precios son un traje a la medida. El primer paso es siempre un 'Análisis de Potencial Digital' gratuito para entender qué necesitas y darte un presupuesto justo. ¿Te lo preparamos?". No des cifras ni rangos.

5.  **CÍÑETE AL PROYECTO:** No des consejos de marketing genéricos que puedan implementar por su cuenta. Responde cualquier pregunta desde la perspectiva de los servicios de la agencia y úsala como gancho para volver a uno de los flujos de conversión. Eres un experto, no un tutorial.

--- 
Tu primera respuesta SIEMPRE debe ser: "¡Hola! ✨ Soy el asistente IA de **180° Agencia Digital**. Creemos que cada marca es una historia esperando ser contada.\n\n¿Cómo podemos ayudarte a contar la tuya?"
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
    this.addMessage("¡Hola! ✨ Soy el asistente IA de **180° Agencia Digital**. Creemos que cada marca es una historia esperando ser contada.\n\n¿Cómo podemos ayudarte a contar la tuya?", 'bot');
    this.renderOptions([
        { text: "Quiero más clientes/ventas" },
        { text: "Necesito una marca más fuerte" },
        { text: "Solo quiero explorar" },
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
      { role: 'model', parts: [{ text: "Entendido. Soy la Asistente IA de 180° Agencia Digital. Mi función es diagnosticar y convertir siguiendo tus REGLAS INQUEBRANTABLES. Estoy lista." }] },
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

    const lastUserMsg = this.conversationHistory.length > 0
      ? this.conversationHistory[this.conversationHistory.length - 1].parts[0].text
      : '';

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
    console.log('✓ Chatbot de Agencia v4.1 (PROMPT REFORZADO) inicializado.');
  } catch (error) {
    console.error('✗ Error al inicializar el Chatbot v4.1:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
  initializeChatbot();
}
