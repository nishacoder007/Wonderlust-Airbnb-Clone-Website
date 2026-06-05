document.addEventListener("DOMContentLoaded", () => {
  // 1. Client-side Form Validation
  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // 2. Interactive Tax Toggle Switch
  const taxSwitch = document.getElementById("tax-toggle");
  if (taxSwitch) {
    taxSwitch.addEventListener("change", () => {
      const basePrices = document.querySelectorAll(".base-price");
      const taxPrices = document.querySelectorAll(".tax-price");

      if (taxSwitch.checked) {
        basePrices.forEach((el) => (el.style.display = "none"));
        taxPrices.forEach((el) => (el.style.display = "inline"));
      } else {
        basePrices.forEach((el) => (el.style.display = "inline"));
        taxPrices.forEach((el) => (el.style.display = "none"));
      }
    });
  }

  // 3. Keep Active Category Filter Underlined
  const urlParams = new URLSearchParams(window.location.search);
  const activeCategory = urlParams.get("category");
  if (activeCategory) {
    const filters = document.querySelectorAll(".category-filter");
    filters.forEach((filter) => {
      const catText = filter.getAttribute("data-category");
      if (catText === activeCategory) {
        filter.classList.add("active");
      } else {
        filter.classList.remove("active");
      }
    });
  }

  // 4. Flash Message Auto-Close after 5 seconds
  const flashAlert = document.querySelector(".flash-wrapper");
  if (flashAlert) {
    setTimeout(() => {
      flashAlert.style.transition = "opacity 0.5s ease";
      flashAlert.style.opacity = "0";
      setTimeout(() => {
        flashAlert.remove();
      }, 500);
    }, 5000);
  }

  // 5. User Profile Dropdown Menu Toggle
  const dropdownBtn = document.getElementById("profileDropdownBtn");
  const dropdownMenu = document.getElementById("profileDropdown");
  
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });
  }
});

// Flash Message Manual Close
function closeAlert(button) {
  const wrapper = button.closest(".flash-wrapper");
  if (wrapper) {
    wrapper.remove();
  }
}
