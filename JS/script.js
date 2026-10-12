
document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("main-header");
    const navMenu = document.getElementById("nav-menu");
    const hamburger = document.getElementById("hamburger");
    const closeButton = document.getElementById("closebtn");
    const toast = document.getElementById("toast");

    const infoModal = document.getElementById("infoModal");
    const contactModal = document.getElementById("contactModal");
    const ratingModal = document.getElementById("ratingModal");

    const contactForm = document.getElementById("contactForm");
    const ratingText = document.getElementById("ratingText");
    const ratingThanks = document.getElementById("ratingThanks");

    let selectedRating = 0;
    let toastTimer;

    // Automatically update the copyright year
    document.getElementById("year").textContent =
        new Date().getFullYear();

    // Show a small notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // MOBILE NAVIGATION
    function openMenu() {
        navMenu.classList.add("active");
        header.classList.add("menu-open");
        hamburger.setAttribute("aria-expanded", "true");
        closeButton.setAttribute("aria-label", "Close navigation");
    }

    function closeMenu() {
        navMenu.classList.remove("active");
        header.classList.remove("menu-open");
        hamburger.setAttribute("aria-expanded", "false");
    }

    hamburger.addEventListener("click", openMenu);
    closeButton.addEventListener("click", closeMenu);

    // Close the menu after choosing a section
    navMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Close the menu when clicking outside it
    document.addEventListener("click", event => {
        if (
            header.classList.contains("menu-open") &&
            !header.contains(event.target)
        ) {
            closeMenu();
        }
    });

    // HIGHLIGHT THE CURRENT NAVIGATION SECTION
    const navLinks = navMenu.querySelectorAll("a");
    const sections = document.querySelectorAll("main section[id]");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        const isActive =
                            link.getAttribute("href") ===
                            `#${entry.target.id}`;

                        link.classList.toggle("active", isActive);

                        if (isActive) {
                            link.setAttribute("aria-current", "location");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                }
            });
        }, {
            rootMargin: "-25% 0px -60% 0px"
        });

        sections.forEach(section => observer.observe(section));
    }

    // MODAL FUNCTIONS
    function openModal(modal) {
        closeMenu();
        modal.classList.add("show");
        document.body.classList.add("modal-open");

        const firstInput = modal.querySelector(
            "input, textarea, button"
        );

        if (firstInput) {
            setTimeout(() => firstInput.focus(), 50);
        }
    }

    function closeModal(modal) {
        modal.classList.remove("show");

        if (!document.querySelector(".modal.show")) {
            document.body.classList.remove("modal-open");
        }
    }

    // MORE INFORMATION POPUP
    document.getElementById("moreInfoBtn").addEventListener(
        "click", () => openModal(infoModal)
    );

    // CONTACT POPUP
    document.getElementById("contactBtn").addEventListener(
        "click", () => openModal(contactModal)
    );

    // Close popup buttons
    document.querySelectorAll("[data-close]").forEach(button => {
        button.addEventListener("click", () => {
            const modal = document.getElementById(
                button.dataset.close
            );

            if (modal) closeModal(modal);
        });
    });

    // Close a popup by clicking its dark background
    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close popup with Escape
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();

            document.querySelectorAll(".modal.show").forEach(modal => {
                closeModal(modal);
            });
        }
    });

    // SKILL LIKE BUTTONS
    document.querySelectorAll(".like-btn").forEach(button => {
        const skill = button.dataset.skill;
        const countElement = button.querySelector(".like-count");
        const icon = button.querySelector("i");

        // Restore the count and this browser's previous like
        const countKey = `portfolio-likes-${skill}`;
        const likedKey = `portfolio-liked-${skill}`;

        let count = Number(localStorage.getItem(countKey)) || 0;
        let liked = localStorage.getItem(likedKey) === "true";

        function updateLikeButton() {
            countElement.textContent = count;
            button.classList.toggle("liked", liked);
            button.setAttribute("aria-pressed", String(liked));

            icon.className = liked
                ? "fa-solid fa-heart"
                : "fa-regular fa-heart";

            button.setAttribute(
                "aria-label",
                `${liked ? "Unlike" : "Like"} ${skill}. ${count} likes`
            );
        }

        updateLikeButton();

        button.addEventListener("click", () => {
            if (liked) {
                count = Math.max(0, count - 1);
                liked = false;
            } else {
                count++;
                liked = true;
            }

            localStorage.setItem(countKey, count);
            localStorage.setItem(likedKey, liked);

            updateLikeButton();

            showToast(
                liked ? "Thanks for liking this skill!" :
                    "Your like has been removed."
            );
        });
    });

    // CONTACT FORM
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("senderName").value.trim();
        const email = document.getElementById("senderEmail").value.trim();
        const message = document.getElementById("senderMessage").value.trim();

        if (!name || !email || !message) {
            showToast("Please complete all fields.");
            return;
        }

        // Prepare an email using the visitor's default email app
        const recipient = "tshering.phuntsho671@gmail.com";

        const subject = encodeURIComponent(
            `Portfolio message from ${name}`
        );

        const body = encodeURIComponent(
            `Name: ${name}\n` +
            `Email: ${email}\n\n` +
            `Message:\n${message}`
        );

        const mailtoLink =
            `mailto:${recipient}?subject=${subject}&body=${body}`;

        closeModal(contactModal);

        // Reset the rating selection for the next visitor
        selectedRating = 0;
        ratingThanks.textContent = "";
        ratingText.textContent = "Select your rating.";

        document.getElementById("ratingFeedback").value = "";

        document.querySelectorAll("#ratingStars button").forEach(star => {
            star.classList.remove("selected");
            star.setAttribute("aria-pressed", "false");
        });

        // Open the email app and show the rating popup
        window.location.href = mailtoLink;

        setTimeout(() => {
            openModal(ratingModal);
        }, 300);
    });

    // STAR RATING
    const starButtons = document.querySelectorAll(
        "#ratingStars button"
    );

    function updateStars(rating) {
        starButtons.forEach(star => {
            const value = Number(star.dataset.rating);
            const selected = value <= rating;

            star.classList.toggle("selected", selected);
            star.setAttribute("aria-pressed", String(value === rating));
        });

        const descriptions = [
            "",
            "Poor",
            "Fair",
            "Good",
            "Very good",
            "Excellent"
        ];

        ratingText.textContent = descriptions[rating] || "Select your rating.";
    }

    starButtons.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = Number(star.dataset.rating);
            updateStars(selectedRating);
        });

        // Preview stars when using a mouse
        star.addEventListener("mouseenter", () => {
            updateStars(Number(star.dataset.rating));
        });
    });

    document.getElementById("ratingStars").addEventListener(
        "mouseleave", () => updateStars(selectedRating)
    );

    // SAVE RATING IN THIS BROWSER
    document.getElementById("submitRating").addEventListener(
        "click", () => {
            if (!selectedRating) {
                showToast("Please select a star rating first.");
                return;
            }

            const feedback = document
                .getElementById("ratingFeedback")
                .value.trim();

            const ratingRecord = {
                rating: selectedRating,
                feedback: feedback,
                date: new Date().toISOString()
            };

            // Ratings are stored locally, not sent to a server
            const ratings = JSON.parse(
                localStorage.getItem("portfolio-ratings") || "[]"
            );

            ratings.push(ratingRecord);

            localStorage.setItem(
                "portfolio-ratings",
                JSON.stringify(ratings)
            );

            ratingThanks.textContent =
                `Thank you for your ${selectedRating}-star rating!`;

            showToast("Thank you for your feedback!");

            document.getElementById("submitRating").disabled = true;

            setTimeout(() => {
                closeModal(ratingModal);
                document.getElementById("submitRating").disabled = false;
            }, 1800);
        }
    );
});
