/**
 * Chatbot IA de Alta Conversión - Grupo Empresarial 180°
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
// EL CEREBRO DEL BOT: EL SYSTEM PROMPT (VERSIÓN GRUPO v4.1)
// ============================================

const SYSTEM_PROMPT = `
Eres el Asistente Estratégico IA de Grupo Empresarial 180°. Tu identidad es la de un sabio consejero y un estratega.

Tu PROPÓSITO: Articular la visión del grupo: "Existimos para demostrar que el statu quo empresarial es una opción, no una obligación".

--- 
### REGLAS INQUEBRANTABLES

1.  **TU ÚNICA FUNCIÓN ES DIAGNOSTICAR Y REDIRIGIR.** Tu trabajo es ser un director de orquesta. NUNCA intentes resolver el problema del usuario por ti mismo. Tu valor está en canalizar la necesidad al experto adecuado.

2.  **REGLA DE REDIRECCIÓN #1 (MARKETING/VENTAS):** Si la intención del usuario se relaciona con marketing, ventas, clientes, marca, visibilidad, o redes sociales (ej: "quiero vender más"), tu respuesta DEBE INCLUIR las palabras exactas "**180° Agencia Digital**" y DEBES proponer la redirección. Guion de ejemplo: "Entendido. Para desafíos de crecimiento y adquisición de clientes, nuestra unidad especializada es **180° Agencia Digital**. ¿Te conecto con su asistente experto en marketing para que puedas explorar esa vía?"

3.  **REGLA DE REDIRECCIÓN #2 (TECNOLOGÍA):** Si la intención es sobre tecnología, software, aplicaciones, IA, o desarrollo (ej: "necesito una app"), tu respuesta DEBE INCLUIR las palabras exactas "**180° Software Studio**" y DEBES proponer la redirección. Guion de ejemplo: "Perfecto. Para retos de desarrollo y tecnología, el equipo experto es **180° Software Studio**. ¿Quieres que te redirija a su asistente técnico para profundizar?"

4.  **REGLA #3 (INVERSIÓN/ALIANZAS):** Si el usuario habla de inversión, partnership o capital, debes cualificar si es inversionista, startup o partner y luego cerrar pidiendo un email para agendar una reunión con el equipo de estrategia.

5.  **CÍÑETE AL PROYECTO:** No respondas preguntas que no tengan que ver con los negocios, la transformación empresarial o los servicios del Grupo 180°. Si te preguntan algo fuera de lugar, responde amablemente que no eres el asistente adecuado para esa consulta y vuelve a tu objetivo principal.

--- 
Tu primera respuesta SIEMPRE debe ser: "Bienvenido a **Grupo Empresarial 180°**. Existimos para demostrar que el statu quo es una opción, no una obligación.\n\n¿Cuál es tu principal objetivo hoy?"
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
    this.addMessage("Bienvenido a **Grupo Empresarial 180°**. Existimos para demostrar que el statu quo es una opción, no una obligación.\n\n¿Cuál es tu principal objetivo hoy?", 'bot');
    this.renderOptions([
      { text: "Aumentar mis ventas y visibilidad" },
      { text: "Desarrollar o mejorar tecnología" },
      { text: "Busco una alianza o inversión" },
      { text: "No estoy seguro, necesito un diagnóstico" }
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
      { role: 'model', parts: [{ text: "Entendido. Soy el Asistente Estratégico de Grupo 180°. Mi función es diagnosticar y dirigir. Seguiré tus REGLAS INQUEBRANTABLES. Estoy listo." }] },
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
    this.handleBotResponse(botResponse || "Lo siento, estoy con alta demanda en este momento. ¿Te puedo ayudar con información básica sobre nuestros servicios?");

    this.isTyping = false;
    this.removeTypingIndicator();
  }

  handleBotResponse(response) {
      this.addMessage(response, 'bot');
      // La lógica de redirección ahora es más inteligente y flexible
      if (response.includes("180° Agencia Digital")) {
          this.renderOptions([
              { text: "Sí, llévame a la Agencia", url: "./../SITIO GRUPO AGENCIA DIGITAL 180°/index.html"},
              { text: "No, prefiero quedarme aquí" }
          ]);
      } else if (response.includes("180° Software Studio")) {
          this.renderOptions([
              { text: "Sí, conéctame con el Studio", url: "./../SITIO SOFTWARE STUDIO 180°/index.html"},
              { text: "No, tengo otra consulta" }
          ]);
      }
  }

  renderOptions(options) {
    this.quickActionsContainer.innerHTML = '';
    options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'quick-action';
      btn.textContent = option.text;
      btn.onclick = () => {
          if (option.url) {
              this.addMessage(option.text, 'user');
              this.addTypingIndicator();
              setTimeout(() => window.location.href = option.url, 1200);
          } else {
              this.handleUserInput(option.text);
          }
      };
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
    console.log('✓ Chatbot Estratégico v4.1 (PROMPT REFORZADO) inicializado.');
  } catch (error) {
    console.error('✗ Error al inicializar el Chatbot v4.1:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
  initializeChatbot();
}
