/**
 * NotificationManager Class: Manages notifications on a web page.
 *
 * Features:
 * - Displays notifications in a styled container with animations.
 * - Aggregates multiple notifications into a single display.
 * - Tracks dismissed notifications using localStorage.
 * - Provides methods to add, dismiss, reset, and render notifications.
 *
 * How it works:
 * - Creates a notification container and overlay on initialisation.
 * - Notifications are added to an internal array and rendered dynamically.
 * - Dismissal updates localStorage and hides notifications accordingly.
 */

class NotificationManager {
  constructor(options = {}) {
    // default configs
    this.config = {
      containerID: "notification-container",
      maxVisibleNotifications: 1,
      animationDuration: 300,
      ...options,
    };

    // initialise storage
    this.notifications = [];
    this.createContainer();
  }

  // container for notifications
  createContainer() {
    // styles for notification box
    const styles = `
        #${this.config.containerID} {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10001;
          max-width: 400px;
          width: 100%;
        }
        .notification {
          background-color: var(--panel-bg);
          color: var(--text-color);
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 10px;
          padding: 15px;
          position: relative;
          overflow: hidden;
          transition: background-color 0.3s, color 0.3s;
        }
        .notification-content {
          margin-right: 30px;
        }
        .notification-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #888;
        }
        .notification-enter {
          opacity: 0;
          transform: translateY(20px);
        }
        .notification-enter-active {
          opacity: 1;
          transform: translateY(0);
        }
        .notification-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .notification-exit-active {
          opacity: 0;
          transform: translateY(20px);
        }
        #notification-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 10000;
          display: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        #notification-overlay.show {
          display: block;
          opacity: 1;
        }
      `;

    // style element
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // dim bg when overlay is open
    const overlayEl = document.createElement("div");
    overlayEl.id = "notification-overlay";
    document.body.appendChild(overlayEl);

    // container for notifications
    const containerEl = document.createElement("div");
    containerEl.id = this.config.containerID;
    document.body.appendChild(containerEl);
  }

  // add a new notification
  addNotification(notification) {
    // Validate
    if (!notification.id || !notification.content) {
      console.error("Notification must have an id and content");
      return;
    }

    // check notification dismissed
    const isDismissed =
      localStorage.getItem(`notification-${notification.id}`) === "true";
    if (isDismissed) return;

    // Add to notifications array
    this.notifications.push(notification);
    this.renderNotifications();
  }

  renderNotifications() {
    const container = document.getElementById(this.config.containerID);
    const overlay = document.getElementById("notification-overlay");
    container.innerHTML = ""; // clear existing notifications

    // get undismissed notifications
    const unseenNotifications = this.notifications.filter((notification) => {
      const isDismissed =
        localStorage.getItem(`notification-${notification.id}`) === "true";
      return !isDismissed;
    });

    if (unseenNotifications.length === 0) {
      // HIDE overlay if there are no notifications to show
      overlay.classList.remove("show");
      return;
    }

    // SHOW overlay if there are notifications to show
    overlay.classList.add("show");

    // aggregate content of ALL UNSEEN notifications
    const aggregatedContent = unseenNotifications
      .map((n) => `<p>${n.content}</p>`)
      .join("");

    // create a SINGLE notification element
    const notificationEl = document.createElement("div");
    notificationEl.className = `notification notification-enter`;
    notificationEl.innerHTML = `
          <div class="notification-content">${aggregatedContent}</div>
          <button class="notification-close" data-id="all">×</button>
      `;

    // close btn event listner to dismiss all
    const closeBtn = notificationEl.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => this.dismissAllNotifications());

    // trigger reflow for animation
    container.appendChild(notificationEl);
    requestAnimationFrame(() => {
      notificationEl.classList.remove("notification-enter");
    });
  }

  // dismiss ONE notification
  dismissNotification(id) {
    // mark as dismissed
    localStorage.setItem(`notification-${id}`, "true");

    // remove from notifications array
    this.notifications = this.notifications.filter((n) => n.id !== id);

    // re-render notifications
    this.renderNotifications();
  }

  dismissAllNotifications() {
    // ALL notifications dismissed in local storage
    this.notifications.forEach((notification) => {
      localStorage.setItem(`notification-${notification.id}`, "true");
    });

    // clear notifications
    this.notifications = [];

    // hiding overlay
    const overlay = document.getElementById("notification-overlay");
    overlay.classList.remove("show");

    // re-render notifications
    this.renderNotifications();
  }

  // reset a specific notification (or all if no id provided)
  resetNotification(id) {
    if (id) {
      // reset specific notif
      localStorage.removeItem(`notification-${id}`);
    } else {
      // reset all notifications
      this.notifications.forEach((notification) => {
        localStorage.removeItem(`notification-${notification.id}`);
      });
    }

    // then re-render
    this.renderNotifications();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const notifManager = new NotificationManager();

  notifManager.addNotification({
    id: "v1.0.0",
    content:
      "v1.0.0: Initial release. This website has finally been completed, expect new features soon.",
  });

  notifManager.addNotification({
    id: "",
    content: "",
  });
});
