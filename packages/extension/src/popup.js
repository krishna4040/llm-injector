document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("server-status");
  const updateButton = document.getElementById("update-server-url");

  // Request server status
  chrome.runtime.sendMessage({ type: "GET_SERVER_STATUS" }, (response) => {
    statusElement.textContent = response.status;
  });

  // Update server URL
  updateButton.addEventListener("click", () => {
    const newUrl = prompt("Enter new server URL:");
    if (newUrl) {
      chrome.runtime.sendMessage(
        { type: "UPDATE_SERVER_URL", url: newUrl },
        (response) => {
          if (response.success) {
            alert("Server URL updated successfully!");
          } else {
            alert("Failed to update server URL.");
          }
        },
      );
    }
  });
});
