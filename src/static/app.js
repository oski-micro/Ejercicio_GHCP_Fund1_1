document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      activitiesList.innerHTML = '<p style="color: #999; font-style: italic;">Loading activities...</p>';
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details], index) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        activityCard.style.animation = `slideIn 0.5s ease forwards`;
        activityCard.style.animationDelay = `${index * 0.1}s`;
        activityCard.style.opacity = "0";

        const spotsLeft = details.max_participants - details.participants.length;
        const isFull = spotsLeft === 0;
        const participantsList = details.participants.length > 0
          ? details.participants.map(p => `<li>${p}</li>`).join("")
          : "<li><em>No participants yet</em></li>";

        const availabilityClass = isFull ? "full" : "available";
        const availabilityText = isFull ? "Activity Full" : `${spotsLeft} spots left`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> <span class="availability ${availabilityClass}">${availabilityText}</span></p>
          <div class="participants-section">
            <strong>Participants (${details.participants.length}/${details.max_participants}):</strong>
            <ul class="participants-list">
              ${participantsList}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = `${name}${isFull ? " (FULL)" : ""}`;
        option.disabled = isFull;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = '<p style="color: #c62828;">Failed to load activities. Please try again later.</p>';
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    if (!activity) {
      messageDiv.textContent = "Please select an activity";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      return;
    }

    const submitButton = signupForm.querySelector("button");
    const originalText = submitButton.textContent;
    submitButton.textContent = "Signing up...";
    submitButton.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        
        // Refresh activities list after successful signup
        setTimeout(() => {
          fetchActivities();
        }, 1500);
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });

  // Initialize app
  fetchActivities();
});
