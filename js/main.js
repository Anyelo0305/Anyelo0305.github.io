// Fundación Inclusión Sin Fronteras — comportamiento compartido del sitio
(function () {
  "use strict";

  /* ---------- Menú móvil accesible ---------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var closeBtn = document.querySelector("[data-nav-close]");
  var nav = document.querySelector("[data-nav]");
  var scrim = document.querySelector("[data-nav-scrim]");

  function openNav() {
    nav.classList.add("is-open");
    scrim.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }
  function closeNav() {
    nav.classList.remove("is-open");
    scrim.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    toggle.focus();
  }
  if (toggle && nav && scrim && closeBtn) {
    toggle.addEventListener("click", openNav);
    closeBtn.addEventListener("click", closeNav);
    scrim.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav();
    });
    // Cierra el menú al navegar por un enlace (móvil)
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < 900) closeNav();
      });
    });
  }

  /* ---------- Aparición progresiva al hacer scroll ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(
    ".card, .audience-card, .value-item, .mv-card, .program-detail, .miia-item, .contact-info-card, [data-contact-form], .cta-strip, .photo-frame, .note-box"
  );
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    // El retraso se calcula por posición dentro de su propio grupo de hermanos,
    // para que las tarjetas de una misma fila aparezcan en cascada, visible a simple vista.
    var siblingIndex = new Map();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var count = siblingIndex.get(parent) || 0;
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(count, 5) * 0.12 + "s";
      siblingIndex.set(parent, count + 1);
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Año actual en el footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Preselección de "tipo de interés" en el formulario de contacto ---------- */
  var params = new URLSearchParams(window.location.search);
  var interestParam = params.get("interes");
  if (interestParam) {
    var radio = document.querySelector('input[name="tipo-interes"][value="' + interestParam + '"]');
    if (radio) radio.checked = true;
  }

  /* ---------- Validación del formulario de contacto ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");

    function setError(field, message) {
      var wrapper = field.closest(".field") || field.closest("fieldset");
      if (!wrapper) return;
      var errorEl = wrapper.querySelector(".error-text");
      if (message) {
        wrapper.classList.add("has-error");
        if (errorEl) errorEl.textContent = message;
      } else {
        wrapper.classList.remove("has-error");
        if (errorEl) errorEl.textContent = "";
      }
    }

    function validate() {
      var valid = true;

      var nombre = form.querySelector("#nombre");
      if (!nombre.value.trim()) {
        setError(nombre, "Por favor escribe tu nombre completo.");
        valid = false;
      } else setError(nombre, "");

      var telefono = form.querySelector("#telefono");
      var telValue = telefono.value.trim();
      if (!telValue) {
        setError(telefono, "Por favor escribe un número de teléfono.");
        valid = false;
      } else if (!/^[0-9+()\s-]{7,15}$/.test(telValue)) {
        setError(telefono, "Ingresa un número de teléfono válido.");
        valid = false;
      } else setError(telefono, "");

      var correo = form.querySelector("#correo");
      var correoValue = correo.value.trim();
      if (!correoValue) {
        setError(correo, "Por favor escribe tu correo electrónico.");
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoValue)) {
        setError(correo, "Ingresa un correo electrónico válido.");
        valid = false;
      } else setError(correo, "");

      var interes = form.querySelector('input[name="tipo-interes"]:checked');
      var interesFieldset = form.querySelector("[data-interes-fieldset]");
      if (!interes) {
        setError(interesFieldset, "Selecciona una opción.");
        valid = false;
      } else setError(interesFieldset, "");

      var mensaje = form.querySelector("#mensaje");
      if (!mensaje.value.trim()) {
        setError(mensaje, "Cuéntanos brevemente en qué podemos ayudarte.");
        valid = false;
      } else setError(mensaje, "");

      var politica = form.querySelector("#politica");
      var politicaField = politica.closest(".field");
      if (!politica.checked) {
        setError(politica, "Debes aceptar la política de tratamiento de datos para continuar.");
        valid = false;
      } else setError(politica, "");

      return valid;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.classList.remove("success", "error", "is-visible");

      if (!validate()) {
        status.textContent = "Revisa los campos marcados en rojo antes de enviar el formulario.";
        status.classList.add("error", "is-visible");
        var firstError = form.querySelector(".has-error input, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      // Este sitio es una propuesta estática: aquí se debe conectar
      // el formulario a un servicio de envío de correo o backend real.
      status.textContent = "¡Gracias por escribirnos! Hemos recibido tu mensaje y te contactaremos pronto.";
      status.classList.add("success", "is-visible");
      form.reset();
    });
  }
})();
