// toursRegistry.js

import { driver } from "driver.js";
import { $authHost } from "../../utils/api/http";

export const TOUR_ORDER = ["departments", "positions", "tasks", "employees"]; // add new ids here

// ➜ 1) HELPER: CREATE A DEPARTMENT ON SKIP
async function createDepartmentOnSkip() {
  // Build a sensible default
  const tz =
    Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || "Europe/Moscow";

  const payload = {
    title: "Main department",
    description: "Auto-created when onboarding is skipped",
    timezone: tz,
    check_in_time: "09:00",
    check_out_time: "18:00",
    is_default: true,
  };

  const res = await $authHost.post("/organization/department", payload);

  return res;
}

function purgeAllTourFlags() {
  try {
    // 1) clean up legacy keys
    const KEYS = [
      "start_tour",
      "tours_state_v1",
      "tours_state",
      "tour_state_v1",
      "tour_state",
      "tour:last",
      "tour:step",
      "tour:state",
      "departments",
      "positions",
      "tasks",
      "employees",
    ];
    for (const k of KEYS) {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    }
    const wipe = (storage) => {
      const toDel = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (
          /^(driver|tour:|tours?_state)/i.test(key) ||
          /^tour(s)?_/i.test(key)
        ) {
          toDel.push(key);
        }
      }
      toDel.forEach((k) => storage.removeItem(k));
    };
    wipe(sessionStorage);
    wipe(localStorage);

    // 2) Mark all tours as completed
    const completed = Object.fromEntries(TOUR_ORDER.map((id) => [id, true]));
    localStorage.setItem(
      "tours_state_v1",
      JSON.stringify({ version: 1, current: null, completed })
    );

    window.location.reload();
  } catch {
    // noop
  }

  // 3) Notify the app (current tab) that everything is finished
  // Persist that EVERYTHING is finished
  const completed = Object.fromEntries(TOUR_ORDER.map((id) => [id, true]));
  localStorage.setItem(
    "tours_state_v1",
    JSON.stringify({ version: 1, current: null, completed })
  );
  // Notify the app (same tab)
  window.dispatchEvent(new CustomEvent("tour:all:finished"));
}

const handlePopoverRender = (drv, popover, skipType) => {
  if (document.body.dataset.tourNoSkip === "1") return; // don't show "Skip" on final steps

  const skip = document.createElement("button");
  skip.innerText = "Skip";
  skip.classList.add("driver-skip-btn");

  const desc = popover.description;

  desc.classList.remove("scrollable", "has-scroll-hint");
  const hint = desc.querySelector(".scroll-hint");
  if (hint) hint.remove();

  // Check if the description overflows
  const overflow = desc.scrollHeight > desc.clientHeight + 5;
  if (overflow) {
    desc.classList.add("scrollable", "has-scroll-hint");

    // Visual hint
    const hintEl = document.createElement("div");
    hintEl.className = "scroll-hint";
    hintEl.innerHTML = "⬇️ Scroll down";
    desc.appendChild(hintEl);

    // Remove the hint after 4 seconds
    setTimeout(() => hintEl.remove(), 4000);
  }

  // Guard against double-clicks
  let busy = false;

  skip.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const hasDepartment = JSON.parse(sessionStorage.getItem("departments"));

    const ok = confirm(
      `Skip the ${skipType} onboarding?\n\n${
        String(skipType).toLowerCase() === "departments" &&
        hasDepartment === null
          ? "If you skip this onboarding, a department will be created automatically."
          : "We recommend continuing—this helps you understand the setup flow."
      }`
    );
    if (!ok) return;

    // Only for "departments" we create a default department on skip
    if (
      String(skipType).toLowerCase() === "departments" &&
      hasDepartment === null
    ) {
      try {
        busy = true;
        skip.disabled = true;
        skip.innerText = "Creating department…";

        const data = await createDepartmentOnSkip();

        // Notify the app in case something needs to react
        window.dispatchEvent(
          new CustomEvent("tour:departments:skip:create:success", {
            detail: data,
          })
        );

        // Show a toast if sonner is available
        try {
          const { toast } = await import("sonner");
          toast.success("Department created");
        } catch {
          /* ignore */
        }

        // Finish the tour only after successful creation
        if (drv && typeof drv.destroy === "function") drv.destroy();
      } catch (err) {
        // Error: stay in the tour so the user can continue/retry
        try {
          const { toast } = await import("sonner");
          toast.error(
            `Couldn't create a department${
              err?.message ? `: ${err.message}` : ""
            }`
          );
        } catch {
          /* ignore */
        }
        skip.disabled = false;
        skip.innerText = "Skip";
        busy = false;
      }
      return;
    }

    // For other sections: default behavior
    if (drv && typeof drv.destroy === "function") drv.destroy();
  };

  if (popover.footerButtons) popover.footerButtons.appendChild(skip);
};

const errorEmptyInput = (element, options, message) => {
  const input =
    element.querySelector("input") || element.querySelector("textarea");
  const value = input?.value?.trim() || "";

  if (value.length === 0) {
    input.classList.add("input-error");
    input.focus();

    import("sonner").then(({ toast }) => {
      toast.error(message);
    });

    return false;
  }

  options.driver.moveNext();
  return true;
};

// ===== Utils: wait for selector + convenient cleanup
function waitForSelector(selector, onFound, { timeout = 10000 } = {}) {
  const el = document.querySelector(selector);
  if (el) {
    onFound(el);
    return () => {};
  }

  let done = false;
  const timer = setTimeout(() => {
    if (done) return;
    done = true;
    observer.disconnect();
  }, timeout);

  const observer = new MutationObserver(() => {
    const elNow = document.querySelector(selector);
    if (elNow) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      observer.disconnect();
      onFound(elNow);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  return () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    observer.disconnect();
  };
}

// small helper to store/cleanup a step's DOM cleanup
function attachWaitCleanup(target, cleanup) {
  if (!target) return;
  if (target._tourCleanup) target._tourCleanup();
  target._tourCleanup = cleanup;
}
function clearWaitCleanup(target) {
  if (!target) return;
  target._tourCleanup?.();
  delete target._tourCleanup;
}

// wrapper: wait for a menu by data-tour and move to a step
function waitForMenuAndGo(options, dataTour, moveStep, cfg) {
  return waitForSelector(
    `[data-tour="${dataTour}"]`,
    () => {
      setTimeout(() => options.driver.moveTo(moveStep), 150);
    },
    cfg
  );
}

function closeDropdownAndGo(
  headerSelector,
  menuSelector,
  options,
  { maxWait = 600, afterCloseDelay = 40, afterClose } = {}
) {
  const header = document.querySelector(headerSelector);
  const wasOpen = !!document.querySelector(menuSelector);

  if (wasOpen && header) {
    header.click(); // trigger closing
  }

  const t0 = performance.now();

  const waitClosed = () => {
    const stillOpen = !!document.querySelector(menuSelector);
    const elapsed = performance.now() - t0;

    if (!stillOpen) {
      setTimeout(() => {
        if (typeof afterClose === "function") {
          afterClose();
        } else {
          options.driver.moveNext();
        }
      }, afterCloseDelay);
      return;
    }
    if (elapsed > maxWait) {
      // fallback: if it didn't close, move on
      if (typeof afterClose === "function") {
        afterClose();
      } else {
        options.driver.moveNext();
      }
      return;
    }
    requestAnimationFrame(waitClosed);
  };

  waitClosed();
}

const requireOptionSelected = (
  selector,
  regex,
  message,
  {
    // for single-select
    labelSelector = "span",
    // for multi-select (keep auto-detect)
    isMulti, // can be explicitly true/false if needed
    multiTagSelector = '[class*="multiValueTag"]', // selected value tags
  } = {}
) => {
  const header = document.querySelector(selector);
  if (!header) {
    console.warn("requireOptionSelected: header not found", selector);
    return false;
  }

  // Auto-detect multi-select by presence of tags in the header
  const isMultiMode =
    typeof isMulti === "boolean"
      ? isMulti
      : !!header.querySelector(multiTagSelector);

  let ok = false;

  if (isMultiMode) {
    // MULTI: count selected tags
    const tags = header.querySelectorAll(multiTagSelector);
    ok = tags && tags.length > 0;
  } else {
    // SINGLE: check label text (and placeholder via regex)
    const label =
      header.querySelector(labelSelector) ||
      header.querySelector('[data-tour$=".label"]'); // fallback
    const text = (label?.textContent || "").trim();
    ok = !!text && !(regex && regex.test(text));
  }

  if (!ok) {
    header.classList.add("input-error");
    setTimeout(() => header.classList.remove("input-error"), 1200);

    import("sonner")
      .then(({ toast }) => toast.error(message))
      .catch(() => console.warn("sonner not found"));

    return false; // block advancing
  }

  return true; // allow default Next
};

const isMobile = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 500px)").matches;

// --- Helpers: dynamic frequency description
function getFrequencyDescription(selectedText = "") {
  const t = selectedText.toLowerCase();

  if (/(daily|every\s*day)/.test(t)) {
    return `This task runs <b>every day</b>.\n
Choose the time when it should appear for employees.`;
  }
  if (/(weekly|every\s*week)/.test(t)) {
    return `This task runs <b>weekly</b>.\n
Select the days of the week when it should be assigned.`;
  }
  if (/(monthly|every\s*month)/.test(t)) {
    return `This task runs <b>on specific days of the month</b>.\n
Pick the dates (for example, the 1st and 15th) and the time.`;
  }
  if (/(one[\s-]?time|once|single)/.test(t)) {
    return `This is a <b>one-time</b> task.\n
Choose the exact date and time.`;
  }
  // default
  return `Adjust the schedule settings for the selected frequency.`;
}

function setNextFrequencyStepDesc(options, selectedText) {
  const steps = options?.config?.steps || [];
  const nextStep = steps.find(
    (s) => s.element === '[data-tour="form.tasks.frequency-selectors"]'
  );
  if (nextStep?.popover) {
    nextStep.popover.description = getFrequencyDescription(selectedText);
  }
}

// --- Helpers: dynamic toggles description
function getSwitchersDesc(selectedType = "") {
  const t = (selectedType || "").toLowerCase();

  if (/photo/.test(t)) {
    return `Here you configure the <b>task behavior</b>:\n
      <ul>
        <li><b>Overdue notification</b> — a manager will be notified if the task isn't completed on time</li>
        <li><b>Photo required</b> — an employee must attach a photo to complete the task</li>
        <li><b>Photo is mandatory</b> — without a photo, the task won't be considered completed</li>
        <li><b>Include in daily report</b> — the task will be included in the end-of-day Telegram report for managers</li>
      </ul>`;
  }

  return `Here you can <b>fine-tune the task behavior</b>:\n
      <ul>
        <li><b>Overdue notification</b> — a manager will be notified if the task isn't completed on time</li>
        <li><b>Include in daily report</b> — the task will be included in the end-of-day Telegram report for managers</li>
      </ul>`;
}

function setSwitchersStepDesc(options, selectedType) {
  const steps = options?.config?.steps || [];
  const switchersStep = steps.find(
    (s) => s.element === '[data-tour="form.tasks.switchers"]'
  );
  if (switchersStep?.popover) {
    switchersStep.popover.description = getSwitchersDesc(selectedType);
  }
}

const goToStepByElement = (options, elementSelector) => {
  const i = options?.config?.steps?.findIndex(
    (s) => s.element === elementSelector
  );
  if (i >= 0) options.driver.moveTo(i);
  else options.driver.movePrev?.();
};

// ✔ universal check: toast + highlight an element
function showErrorOn(elOrSelector, message) {
  const el =
    typeof elOrSelector === "string"
      ? document.querySelector(elOrSelector)
      : elOrSelector;

  if (el) {
    el.classList.add("input-error");
    setTimeout(() => el.classList.remove("input-error"), 1200);
  }
  import("sonner")
    .then(({ toast }) => toast.error(message))
    .catch(() => {});
}

// ✔ does the container have selected items?
function hasSelectedInside(containerSelector, selectedQuery) {
  const root = document.querySelector(containerSelector);
  if (!root) return false;

  // NEW: if the container itself is marked selected — that's ok too
  if (
    root.matches('[data-selected="true"], .selected, [aria-pressed="true"]')
  ) {
    return true;
  }
  return !!root.querySelector(selectedQuery);
}

// ✔ does input[type=time] have a value?
function hasTimeValue(containerSelector) {
  const root = document.querySelector(containerSelector);
  const input = root?.querySelector('input[type="time"]');
  return !!(input && input.value && input.value.trim().length > 0);
}

// ✔ is a date selected for a one-time task?
function hasOneTimeDate() {
  const host = document.querySelector(
    '[data-tour="form.tasks.onetime.calendar"]'
  );
  return host?.getAttribute("data-has-value") === "true";
}

// ✔ configure which steps are visible based on frequency and DOM availability
function applyFrequencyStepsVisibility(options) {
  const steps = options?.config?.steps || [];
  const byEl = (sel) => steps.find((s) => s.element === sel);

  const headerSel = '[data-tour="form.tasks.frequency.header"]';
  const label =
    document.querySelector(`${headerSel} span`)?.textContent?.toLowerCase() ||
    document.querySelector(headerSel)?.textContent?.toLowerCase() ||
    "";

  const showWeekly =
    /week/.test(label) &&
    !!document.querySelector('[data-tour="form.tasks.weekdays"]');

  const showMonthly =
    /month/.test(label) &&
    !!document.querySelector('[data-tour="form.tasks.monthdays"]');

  const showOnetime =
    /(one[\s-]?time|once|single)/.test(label) &&
    !!document.querySelector('[data-tour="form.tasks.onetime.calendar"]');

  const startTimeExists = !!document.querySelector(
    '[data-tour="form.tasks.start-time"] input[type="time"]'
  );
  const deadlineExists = !!document.querySelector(
    '[data-tour="form.tasks.deadline-time"] input[type="time"]'
  );

  const sWeekly = byEl('[data-tour="form.tasks.weekdays"]');
  const sMonthly = byEl('[data-tour="form.tasks.monthdays"]');
  const sOnetime = byEl('[data-tour="form.tasks.onetime.calendar"]');
  const sStart = byEl('[data-tour="form.tasks.start-time"]');
  const sDeadline = byEl('[data-tour="form.tasks.deadline-time"]');

  if (sWeekly) sWeekly.skip = !showWeekly;
  if (sMonthly) sMonthly.skip = !showMonthly;
  if (sOnetime) sOnetime.skip = !showOnetime;
  if (sStart) sStart.skip = !startTimeExists;
  if (sDeadline) sDeadline.skip = !deadlineExists;
}

function getFrequencyTargetSelector(selectedText = "") {
  const t = selectedText.toLowerCase();
  if (/week/.test(t)) return '[data-tour="form.tasks.weekdays"]';
  if (/month/.test(t)) return '[data-tour="form.tasks.monthdays"]';
  if (/(one[\s-]?time|once|single)/.test(t))
    return '[data-tour="form.tasks.onetime.calendar"]';
  // for "daily" there is no separate block — go to start time
  return '[data-tour="form.tasks.start-time"]';
}

function isPhotoTypeSelected() {
  const headerSel = '[data-tour="form.tasks.confirmation-type.header"]';
  const txt = (
    document.querySelector(`${headerSel} span`)?.textContent ||
    document.querySelector(headerSel)?.textContent ||
    window.__tourDoneType ||
    ""
  ).toLowerCase();
  return /photo/.test(txt);
}

function tourDisableSkip() {
  document.body.dataset.tourNoSkip = "1";
  document.querySelector(".driver-skip-btn")?.remove();
}
function tourEnableSkip() {
  delete document.body.dataset.tourNoSkip;
}

export const ToursRegistry = {
  departments: {
    id: "departments",
    route: "/departments",
    readySelectors: ['[data-tour="menu.departments"]'],
    create: (ctx) => {
      let drv; // closure needed so onPopoverRender can call destroy()

      const config = {
        showProgress: true,
        smoothScroll: true,
        allowClose: false,
        popoverClass: "driverjs-theme-dark",
        progressText: "Step {{current}} of {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",

        onDestroyed: () => {
          // completion (normal or via Skip)
          ctx.complete();
        },

        onPopoverRender: (popover) => {
          handlePopoverRender(drv, popover, "departments");
        },

        steps: [
          {
            element: '[data-tour="menu.departments"]',
            popover: {
              title: `Departments`,
              description: `In this section you create departments—e.g. different locations, stores, or teams.\n
                    This helps you assign employees to places and set a schedule per department.

                    Even if you only have one location, you still need a department: it stores the <b>time zone</b>, <b>workday start</b>, and <b>workday end</b> so the system knows when to send notifications and tasks.
                    Without this, the app can’t work correctly.

                    ${
                      isMobile()
                        ? ""
                        : `Click <b>“Departments”</b> in the left menu to open this section.`
                    }`,
              nextBtnText: isMobile() ? "Next" : "Create one",
              onNextClick: (element, step, options) => {
                options.driver.drive(1);
                //   navigate("/departments");
              },
            },
            onHighlighted: (element, step, options) => {
              element?.addEventListener("click", () => {
                options.driver.moveTo(1);
              });
            },
          },
          {
            element: '[data-tour="departments.add"]',
            popover: {
              title: "Create a new department",
              description: `Click <b>“Add”</b> to open the department form.\n
                You can set the key details: <b>name, time zone, workday start and end</b>. Optionally, add a <b>description</b> and mark it as the <b>default</b> department.`,
              onNextClick: (element) => {
                element?.click();
              },
            },
            onHighlighted: (element, _, options) => {
              element?.addEventListener("click", () => {
                setTimeout(() => {
                  options.driver.moveTo(2);
                }, 100);
              });
            },
          },
          {
            element: '[data-tour="modal.nameInput"]',
            popover: {
              title: "Department name",
              description: `Enter a clear name—for example:\n
                <small><i>Pickup point — 16 Zelyonaya St.</i></small>\n
                This helps you quickly recognize departments in lists and settings.`,
              onNextClick: (element, step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Enter a department name to continue"
                );
              },
            },
            onHighlighted: (element) => {
              const input = element.querySelector("input");
              if (input) input.classList.remove("input-error");
            },
          },
          {
            element: '[data-tour="modal.timezone"]',
            popover: {
              title: "Set the time zone",
              description: `If your departments are in <b>different cities</b>, choose the <b>correct</b> time zone.\n
                That way notifications <small>(for example, shift start)</small> arrive at the <b>right local time</b>.`,
              nextBtnText: isMobile() ? "Next" : "Show options",
              onNextClick: (element, _step, options) => {
                // 1) start waiting only on "Next"
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "modal.timezone.menu", 4) // menu step index
                );
                // 2) open menu by clicking the header
                element
                  .querySelector('[data-tour="modal.timezone.header"]')
                  ?.click();
                return false; // we'll advance after the menu appears
              },
            },
            onHighlighted: (element, _step, options) => {
              // Do NOT open the menu here.
              // If the user clicks the header, start waiting then.
              const header =
                element.querySelector('[data-tour="modal.timezone.header"]') ||
                document.querySelector('[data-tour="modal.timezone.header"]');

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "modal.timezone.menu", 4)
                );
              };

              if (header) {
                // remove old handler if any
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },
            onDeselected: (element) => {
              // cleanup waiting + click handler
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
              // don't force-close anything—the user controls it
            },
          },
          {
            element: '[data-tour="modal.timezone.menu"]',
            popover: {
              title: "Choose a time zone",
              description: `Select the time zone where this department operates.\n
                This ensures notifications and schedules match your employees’ <b>local time</b>.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="modal.timezone.header"]';
                const menuSel = '[data-tour="modal.timezone.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /select\s+time\s*zone/i,
                  "Please select a time zone"
                );
                if (!ok) return false;

                // close dropdown and only then advance
                closeDropdownAndGo(headerSel, menuSel, options);
                return false; // prevent double-advance
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="modal.timezone.header"]';
              const menuSel = '[data-tour="modal.timezone.menu"]';

              // generic option selector (for custom selects)
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                // let the UI render the selected value
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /select\s+time\s*zone/i,
                    ""
                  );
                  if (ok) {
                    closeDropdownAndGo(headerSel, menuSel, options);
                  }
                }, 10);
              };

              // remove previous handler if any
              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);

              // Do NOT auto-open here — the menu is already open on this step
            },

            onDeselected: (element) => {
              element._menuOff?.();
              delete element._menuOff;

              // close the menu if it somehow stayed open
              const header = document.querySelector(
                '[data-tour="modal.timezone.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="modal.timezone.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="modal.check-in-time"]',
            popover: {
              title: "Workday start time",
              description: `Set the time when employees <b>start their workday</b>.\n
                At this time they’ll receive a Telegram notification to <b>check in</b> and get their tasks.\n
                <small><i>For example: 09:00</i></small>.`,
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(3);
              },
            },
          },
          {
            element: '[data-tour="modal.check-out-time"]',
            popover: {
              title: "Workday end time",
              description: `Set the time when employees <b>can finish their day</b>.\n
                If someone checks out <b>early</b>, their <b>unfinished</b> tasks will be <b>highlighted</b>.`,
            },
          },
          {
            element: '[data-tour="modal.description"]',
            popover: {
              title: "Add a description (optional)",
              description: `Briefly describe the department—where it is and what it does.\n
                This is <b>optional</b>, but helpful when you have many departments.\n
                <small><i>Example: "Pickup point in Mega Mall, shift 9:00–21:00."</i></small>`,
            },
          },
          {
            element: '[data-tour="modal.default"]',
            popover: {
              title: "Default department",
              description: `This department is currently marked as the <b>default</b>.\n
                New employees who join via the <b>Telegram bot</b> will be attached here automatically.

                The system must always have <b>one default department</b> so it knows where to place new employees.

                If you turn this off and don’t choose another default, you’ll be prompted to set one and some features <small>(like adding employees via the bot)</small> won’t work.`,
            },
          },
          {
            element: '[data-tour="modal.submit"]',
            popover: {
              title: "Save the department",
              description: `Great—now click <b>"Create department"</b> to save.\n
                It will appear in the list and you’ll be able to assign tasks and employees to it.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="modal.submit"]'
                );
                btn?.click();
              },
              onPrevClick: (element, _step, options) => {
                options.driver.movePrevious();
                tourEnableSkip();
              },
            },
            onHighlighted: (element, _step, options) => {
              const onBtnClick = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };
              element.removeEventListener("click", onBtnClick);
              element.addEventListener("click", onBtnClick);

              const onSuccess = () => {
                setTimeout(() => {
                  options.driver.moveNext();
                }, 150);
              };

              const onFail = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };

              window.addEventListener("tour:submit:success", onSuccess, {
                once: true,
              });
              window.addEventListener("tour:submit:fail", onFail, {
                once: true,
              });

              element._tourCleanup = () => {
                element.removeEventListener("click", onBtnClick);
                window.removeEventListener("tour:submit:success", onSuccess);
                window.removeEventListener("tour:submit:fail", onFail);
              };
              tourDisableSkip();
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
            },
          },
          {
            popover: {
              title: "Department created!",
              description: `Nice work.\n
                Next, go to <b>“Positions”</b> to learn how to create roles you’ll use when assigning tasks.\n
                Click <b>“Go to positions”</b> to continue.`,
              nextBtnText: "Go to positions",
              onNextClick: (element, step, options) => {
                options.driver.destroy();
              },
            },
            onDeselected: () => {
              tourEnableSkip();
            },
          },
        ],
      };
      drv = driver(config);

      return drv;
    },
  },

  positions: {
    id: "positions",
    route: "/positions",
    readySelectors: ['[data-tour="menu.positions"]'],
    create: (ctx) => {
      let drv;
      const config = {
        showProgress: true,
        smoothScroll: true,
        allowClose: false,
        popoverClass: "driverjs-theme-dark",
        progressText: "Step {{current}} of {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",

        onDestroyed: () => {
          ctx.complete();
        },

        onPopoverRender: (popover) => {
          handlePopoverRender(drv, popover, "positions");
        },

        steps: [
          {
            element: '[data-tour="menu.positions"]',
            popover: {
              title: "What are positions?",
              description: `Here you create <b>employee positions</b>—for example, <i>manager</i>, <i>courier</i>, or <i>store operator</i>.\n
                Positions help you organize employees and later assign the right tasks.\n
                ${
                  isMobile()
                    ? ""
                    : `Click <b>“Positions”</b> in the left menu to open this section.`
                }`,
            },
            onHighlighted: (element, step, options) => {
              element?.addEventListener("click", () => {
                options.driver.moveNext();
              });
            },
          },
          {
            element: '[data-tour="positions.add"]',
            popover: {
              title: "Create a new position",
              description: `Click <b>“Add”</b> to create a new position.\n
                You can set its name and (optionally) a description.\n
                After that, you’ll be able to assign employees to this position.`,
              onNextClick: (element) => {
                element?.click();
              },
            },
            onHighlighted: (element, _, options) => {
              element?.addEventListener("click", () => {
                setTimeout(() => {
                  options.driver.moveNext();
                }, 100);
              });
            },
          },
          {
            element: '[data-tour="modal.position.name"]',
            popover: {
              title: "Position name",
              description: `Enter a clear, short position name—for example: <i>Store admin</i>, <i>Courier</i>, or <i>Warehouse operator</i>.\n
                Choose wording that clearly reflects what the employee does.`,
              onNextClick: (element, step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Enter a position name to continue"
                );
              },
            },
            onHighlighted: (element) => {
              const input = element.querySelector("input");
              if (input) input.classList.remove("input-error");
            },
          },
          {
            element: '[data-tour="modal.position.description"]',
            popover: {
              title: "Description (optional)",
              description: `If needed, add a short description.\n
                <small><i>For example: processes orders and keeps the area tidy.</i></small>\n
                This helps others understand what this position is for.\n
                This field is optional—you can skip it.`,
              onNextClick: (element, step, options) => {
                options.driver.moveNext();
              },
            },
          },
          {
            element: '[data-tour="modal.position.submit"]',
            popover: {
              title: "Save the position",
              description: `Click <b>“Create”</b> to add the position.\n
                It will appear in the list and you’ll be able to assign employees to it.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="modal.position.submit"]'
                );
                btn?.click();
              },
              onPrevClick: (element, _step, options) => {
                options.driver.movePrevious();
                tourEnableSkip();
              },
            },

            onHighlighted: (element, _step, options) => {
              const onBtnClick = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };
              element.removeEventListener("click", onBtnClick);
              element.addEventListener("click", onBtnClick);

              const onSuccess = () => {
                setTimeout(() => {
                  options.driver.moveNext();
                }, 150);
              };

              const onFail = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };

              window.addEventListener(
                "tour:position:submit:success",
                onSuccess,
                {
                  once: true,
                }
              );
              window.addEventListener("tour:position:submit:fail", onFail, {
                once: true,
              });

              element._tourCleanup = () => {
                element.removeEventListener("click", onBtnClick);
                window.removeEventListener(
                  "tour:position:submit:success",
                  onSuccess
                );
                window.removeEventListener("tour:position:submit:fail", onFail);
              };
              tourDisableSkip();
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
            },
          },
          {
            popover: {
              title: "All set!",
              description: `You’ve created your first <b>position</b>.\n
                Next, move on to <b>tasks</b>: create tasks and assign them to the right positions and departments so the system can distribute work correctly.\n
                Click <b>“Go to tasks”</b> to continue.`,
              nextBtnText: "Go to tasks",
              onNextClick: (element, step, options) => {
                options.driver.destroy();
              },
            },
            onDeselected: () => {
              tourEnableSkip();
            },
          },
        ],
      };
      drv = driver(config);

      return drv;
    },
  },

  tasks: {
    id: "tasks",
    route: "/tasks",
    readySelectors: ['[data-tour="menu.tasks"]'],
    create: (ctx) => {
      let drv; // closure needed so onPopoverRender can call destroy()
      const config = {
        showProgress: true,
        smoothScroll: true,
        allowClose: false,
        popoverClass: "driverjs-theme-dark",
        progressText: "Step {{current}} of {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",

        onDestroyed: () => {
          // completion (normal or via Skip)
          ctx.complete();
        },

        onPopoverRender: (popover) => {
          handlePopoverRender(drv, popover, "tasks");
        },

        steps: [
          {
            element: '[data-tour="menu.tasks"]',
            popover: {
              title: "Tasks",
              description: `Here you create and manage tasks for employees.\n
                Tasks help automate workflows—for example, <b>assign work, track completion, and get reports</b> right in the system.\n
                ${
                  isMobile()
                    ? ""
                    : "Click <b>“Tasks”</b> in the left menu to open this section."
                }`,
              nextBtnText: "Create one",
              onNextClick: (_el, _step, options) => {
                options.driver.moveTo(1);
              },
            },
            onHighlighted: (element, _step, options) => {
              element?.addEventListener("click", () => {
                options.driver.moveTo(1);
              });
            },
          },
          {
            element: '[data-tour="tasks.add"]',
            popover: {
              title: "Create a new task",
              description: `Click <b>${isMobile() ? "+" : `“Add”`}</b> to open the task form.\n
                You’ll be able to define <b>what needs to be done</b>, <b>who it’s for</b>, and <b>when it should run</b>.`,
              onNextClick: (element, _step, options) => {
                element?.click();
                options.driver.moveTo(2);
              },
            },
            onHighlighted: (element, _step, options) => {
              element?.addEventListener("click", () => {
                setTimeout(() => {
                  options.driver.moveTo(2);
                }, 100);
              });
            },
          },
          {
            element: '[data-tour="form.tasks.name"]',
            popover: {
              title: "Task name",
              description: `Enter a clear task name—short and specific.\n
                <small>For example: <b>“Open the store”</b>, <b>“Count the cash register”</b>, or <b>“Take a photo of the display”</b></small>.\n
                A good name makes tasks easy to recognize in lists.`,
              onNextClick: (element, _step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Enter a task name"
                );
              },
            },
          },
          {
            element: '[data-tour="form.tasks.confirmation-type"]',
            popover: {
              title: "Completion proof",
              description: `Choose <b>how an employee will confirm the task is completed</b>.\n
                Click the field to open the options.`,
              nextBtnText: "Show options",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  // menu is step 4
                  waitForMenuAndGo(
                    options,
                    "form.tasks.confirmation-type.menu",
                    4
                  )
                );
                element
                  .querySelector(
                    '[data-tour="form.tasks.confirmation-type.header"]'
                  )
                  ?.click();
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.tasks.confirmation-type.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.tasks.confirmation-type.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(
                    options,
                    "form.tasks.confirmation-type.menu",
                    4
                  )
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },

          {
            element: '[data-tour="form.tasks.confirmation-type.menu"]',
            popover: {
              title: "Proof options",
              description: `Select an option to continue:\n
                 <ul>
                  <li><b>Photo</b> — the employee will attach a photo (for example, a report, a display, or a document).</li>
                  <li><b>Text</b> — the employee will write a comment or completion report.</li>
                  <li><b>Checkbox</b> — a simple done/not done mark with no attachments.</li>
                </ul>
                Click the option that fits this task.`,
              onNextClick: (_el, _step, options) => {
                const headerSel =
                  '[data-tour="form.tasks.confirmation-type.header"]';
                const menuSel =
                  '[data-tour="form.tasks.confirmation-type.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /select\s+(a\s+)?proof|select\s+type/i,
                  "Please select a proof type"
                );
                if (!ok) return false;

                // read selected type from header
                const header = document.querySelector(headerSel);
                const labelText = (
                  header?.querySelector("span")?.textContent ||
                  header?.textContent ||
                  ""
                ).trim();

                // store it and update "Additional settings" description
                window.__tourDoneType = labelText;
                setSwitchersStepDesc(options, labelText);

                const isPhoto = /photo/i.test(labelText);

                closeDropdownAndGo(headerSel, menuSel, options, {
                  afterCloseDelay: 80,
                  afterClose: () => {
                    const acceptStep = options.config.steps.find(
                      (s) =>
                        s.element ===
                        '[data-tour="form.tasks.accept-condition"]'
                    );
                    if (acceptStep) {
                      if (isPhoto) {
                        delete acceptStep.skip;
                        options.driver.moveTo(5);
                      } else {
                        acceptStep.skip = true;
                        options.driver.moveTo(6);
                      }
                    } else {
                      options.driver.moveNext();
                    }
                  },
                });

                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel =
                '[data-tour="form.tasks.confirmation-type.header"]';
              const menuSel = '[data-tour="form.tasks.confirmation-type.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                const selectedText = (item.textContent || "").trim();
                if (selectedText) {
                  // store and update "Additional settings" description immediately
                  window.__tourDoneType = selectedText;
                  setSwitchersStepDesc(options, selectedText);
                }

                // let the UI render the selected value
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /select\s+(a\s+)?proof|select\s+type/i,
                    "Please select a proof type"
                  );
                  if (!ok) return;

                  // close the menu and advance, taking "Photo" into account
                  const isPhoto = /photo/i.test(selectedText);

                  element.removeEventListener("click", onPick);

                  closeDropdownAndGo(headerSel, menuSel, options, {
                    afterCloseDelay: 80,
                    afterClose: () => {
                      const acceptStep = options.config.steps.find(
                        (s) =>
                          s.element ===
                          '[data-tour="form.tasks.accept-condition"]'
                      );
                      if (acceptStep) {
                        if (isPhoto) {
                          delete acceptStep.skip;
                          options.driver.moveTo(5);
                        } else {
                          acceptStep.skip = true;
                          options.driver.moveTo(6);
                        }
                      } else {
                        options.driver.moveNext();
                      }
                    },
                  });
                }, 10);
              };

              element.addEventListener("click", onPick);
              attachWaitCleanup(element, () => {
                element.removeEventListener("click", onPick);
              });
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.tasks.confirmation-type.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.tasks.confirmation-type.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.tasks.accept-condition"]',
            popover: {
              title: "AI acceptance criteria",
              description: `Describe <b>what the system should see in the photo</b> for it to be accepted.\n
                This text is used by AI to validate the image.\n
                Example: “The photo must show the cash report and the total for the day” or “A display photo with products and today’s newspaper”.\n
                <small>Tip: this is an <b>AI prompt</b>—a description of what a “good” photo looks like. If you’re unsure, you can ask ChatGPT to help you phrase it.</small>`,
              onNextClick: (element, _step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Fill in the acceptance criteria"
                );
              },
              onPrevClick: (_element, _step, options) => {
                options.driver.moveTo(3);
              },
            },
            // skip: true, // shown only when "Photo" proof is selected
          },

          {
            element: '[data-tour="form.tasks.dep"]',
            popover: {
              title: "Choose a department",
              description: `Select <b>which department</b> this task belongs to.\n
                By default, the <b>default</b> department is selected. If the task is for another location, pick it from the list.\n
                Tasks are assigned <b>per department</b>, so the same position can have <b>different tasks</b> in different locations.\n
                Click the field to open the department list.`,
              nextBtnText: "Show options",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  // menu is step 7
                  waitForMenuAndGo(options, "form.tasks.dep.menu", 7)
                );
                element
                  .querySelector('[data-tour="form.tasks.dep.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (_element, _step, options) => {
                if (isPhotoTypeSelected()) {
                  return goToStepByElement(
                    options,
                    '[data-tour="form.tasks.accept-condition"]'
                  );
                }
                return goToStepByElement(
                  options,
                  '[data-tour="form.tasks.confirmation-type"]'
                );
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector('[data-tour="form.tasks.dep.header"]') ||
                document.querySelector('[data-tour="form.tasks.dep.header"]');

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.tasks.dep.menu", 7)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.tasks.dep.menu"]',
            popover: {
              title: "Select a department",
              description: `Select the department <b>for which the task is being created</b>.\n
                Remember: tasks are assigned <b>per department</b>, so the same position can have different tasks in different locations.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.tasks.dep.header"]';
                const menuSel = '[data-tour="form.tasks.dep.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /select\s+department/i,
                  "Please select a department"
                );
                if (!ok) return false;

                closeDropdownAndGo(headerSel, menuSel, options);
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.tasks.dep.header"]';
              const menuSel = '[data-tour="form.tasks.dep.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /select\s+department/i,
                    ""
                  );
                  if (ok) {
                    closeDropdownAndGo(headerSel, menuSel, options);
                  }
                }, 10);
              };

              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.tasks.dep.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.tasks.dep.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },

          {
            element: '[data-tour="form.tasks.position"]',
            popover: {
              title: "Choose positions",
              description: `Select <b>which positions</b> this task applies to.\n
                You can pick <b>multiple</b>—for example, if both an admin and a courier are responsible.\n
                Tasks are assigned <b>per position within the selected department</b>, so the same position can have different tasks in different locations.`,
              nextBtnText: "Show options",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  // menu is step 9
                  waitForMenuAndGo(options, "form.tasks.position.menu", 9)
                );
                element
                  .querySelector('[data-tour="form.tasks.position.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (_element, _step, options) => {
                // go back to the department block
                options.driver.moveTo(6);
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.tasks.position.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.tasks.position.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.tasks.position.menu", 9)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.tasks.position.menu"]',
            popover: {
              title: "Select positions",
              description: `Select <b>one or more positions</b> that should receive this task.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.tasks.position.header"]';
                const menuSel = '[data-tour="form.tasks.position.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /select\s+position/i,
                  "Please select a position",
                  { isMulti: true }
                );
                if (!ok) return false;

                closeDropdownAndGo(headerSel, menuSel, options);
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.tasks.position.header"]';
              const menuSel = '[data-tour="form.tasks.position.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              // helper: close menu → go to frequency block
              const advanceToFrequency = () => {
                if (element._tourAdvancing) return; // guard against double-advance
                element._tourAdvancing = true;
                // close the menu and go to the next needed step (not just moveNext)
                closeDropdownAndGo(headerSel, menuSel, options, {
                  afterClose: () => {
                    options.driver.refresh?.();
                    goToStepByElement(
                      options,
                      '[data-tour="form.tasks.frequency"]'
                    );
                    element._tourAdvancing = false;
                  },
                });
              };

              const onCreated = () => {
                advanceToFrequency();
              };

              window.addEventListener(
                "tour:task:position:create:success",
                onCreated,
                { once: true }
              );

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /select\s+position/i,
                    "",
                    { isMulti: true }
                  );
                  if (ok) {
                    closeDropdownAndGo(headerSel, menuSel, options);
                  }
                }, 10);
              };

              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () => {
                element.removeEventListener("click", onPick);
                window.removeEventListener(
                  "tour:task:position:create:success",
                  onCreated
                );
              };
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.tasks.position.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.tasks.position.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },

          {
            element: '[data-tour="form.tasks.frequency"]',
            popover: {
              title: "Choose frequency",
              description: `Decide <b>how often this task should run</b>.\n
                Available options:
                <ul>
                  <li><b>Daily</b> — runs every day.</li>
                  <li><b>Weekly</b> — runs on selected weekdays.</li>
                  <li><b>Monthly</b> — runs on selected dates of the month.</li>
                  <li><b>One-time</b> — runs once, no repeats.</li>
                </ul>
                Click the field to choose an option.`,
              nextBtnText: "Show options",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  // menu is step 11
                  waitForMenuAndGo(options, "form.tasks.frequency.menu", 11)
                );
                element
                  .querySelector('[data-tour="form.tasks.frequency.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (_element, _step, options) => {
                // close previous open menu (just in case)
                const prevHeader = '[data-tour="form.tasks.position.header"]';
                const prevMenu = '[data-tour="form.tasks.position.menu"]';
                if (document.querySelector(prevMenu)) {
                  document.querySelector(prevHeader)?.click();
                }
                goToStepByElement(options, '[data-tour="form.tasks.position"]'); // go to header, not menu
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.tasks.frequency.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.tasks.frequency.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.tasks.frequency.menu", 11)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.tasks.frequency.menu"]',
            popover: {
              title: "Select frequency",
              description: `Choose the frequency that fits this task.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.tasks.frequency.header"]';
                const menuSel = '[data-tour="form.tasks.frequency.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /select\s+frequency/i,
                  "Please select a frequency"
                );
                if (!ok) return false;

                // read selected label from header and update the next step
                const header = document.querySelector(headerSel);
                const selectedText = (
                  header?.querySelector("span")?.textContent ||
                  header?.textContent ||
                  ""
                ).trim();

                setNextFrequencyStepDesc(options, selectedText);
                const targetSel = getFrequencyTargetSelector(selectedText);

                closeDropdownAndGo(headerSel, menuSel, options, {
                  afterClose: () => {
                    // wait until React mounts the required block
                    const cleanup = waitForSelector(
                      targetSel,
                      () => {
                        applyFrequencyStepsVisibility(options);
                        options.driver.refresh?.();
                        goToStepByElement(options, targetSel);
                      },
                      { timeout: 2000 }
                    );
                    // cleanup if the user leaves the step
                    attachWaitCleanup(document.body, cleanup);
                  },
                });
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.tasks.frequency.header"]';
              const menuSel = '[data-tour="form.tasks.frequency.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                const selectedText = item.textContent?.trim() || "";
                if (selectedText) {
                  // update the next step description immediately
                  setNextFrequencyStepDesc(options, selectedText);
                }

                // standard flow: close menu → advance
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /select\s+frequency/i,
                    ""
                  );
                  if (ok) {
                    const targetSel = getFrequencyTargetSelector(selectedText);

                    closeDropdownAndGo(headerSel, menuSel, options, {
                      afterClose: () => {
                        // wait until React mounts the required block
                        const cleanup = waitForSelector(
                          targetSel,
                          () => {
                            applyFrequencyStepsVisibility(options);
                            options.driver.refresh?.();
                            goToStepByElement(options, targetSel);
                          },
                          { timeout: 2000 }
                        );
                        // cleanup if the user leaves the step
                        attachWaitCleanup(document.body, cleanup);
                      },
                    });
                    return false;
                  }
                }, 10);
              };

              // open the menu if it’s closed
              const header = document.querySelector(headerSel);
              const isMenuOpen = !!document.querySelector(menuSel);
              if (!isMenuOpen && header) header.click();

              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.tasks.frequency.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.tasks.frequency.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.tasks.weekdays"]',
            popover: {
              title: "Select weekdays",
              description: `Choose <b>which days</b> this task should run.\n
                For example, for an office routine—pick <b>weekdays</b>.\n
                For a store or warehouse—include weekends if needed.\n
                \n
                <small>Select at least one day so the system knows when to assign the task.</small>`,
              onNextClick: (_el, _step, options) => {
                const ok = hasSelectedInside(
                  '[data-tour="form.tasks.weekdays"]',
                  '[data-selected="true"], .selected, [aria-pressed="true"]'
                );
                if (!ok) {
                  showErrorOn(
                    '[data-tour="form.tasks.weekdays"]',
                    "Select at least one weekday"
                  );
                  return false;
                }

                applyFrequencyStepsVisibility(options); // just in case
                options.driver.refresh?.();
                goToStepByElement(
                  options,
                  '[data-tour="form.tasks.start-time"]'
                );
                return false;
              },
              onPrevClick: (_el, _step, options) => {
                options.driver.moveTo(10); // back to frequency header
              },
            },
          },

          // ——— Monthly: days of month (DaysGrid should set data-selected="true" on selected)
          {
            element: '[data-tour="form.tasks.monthdays"]',
            popover: {
              title: "Select dates of the month",
              description: `Choose <b>which dates</b> of each month this task should run.\n
                For example, pick <b>the 1st and 15th</b> for twice-a-month reporting, or <b>the last day</b> for month-end tasks.\n
                <small>Select at least one date to continue.</small>`,
              onNextClick: (_el, _step, options) => {
                const ok = hasSelectedInside(
                  '[data-tour="form.tasks.monthdays"]',
                  '[data-selected="true"], .selected, [aria-pressed="true"]'
                );
                if (!ok) {
                  showErrorOn(
                    '[data-tour="form.tasks.monthdays"]',
                    "Select at least one date"
                  );
                  return false;
                }

                applyFrequencyStepsVisibility(options); // just in case
                options.driver.refresh?.();
                goToStepByElement(
                  options,
                  '[data-tour="form.tasks.start-time"]'
                );
                return false;
              },
              onPrevClick: (_el, _step, options) => {
                options.driver.moveTo(10);
              },
            },
          },

          // ——— One-time: calendar
          {
            element: '[data-tour="form.tasks.onetime.calendar"]',
            popover: {
              title: "Task due date",
              description: `Choose the <b>specific day</b> when the task should be completed.\n
                This is useful for one-off tasks—for example, a stocktake on the 10th\n
                or a report at the end of the month.`,
              onNextClick: (_el, _step, options) => {
                if (!hasOneTimeDate()) {
                  showErrorOn(
                    '[data-tour="form.tasks.onetime.calendar"]',
                    "Select a date"
                  );
                  return false;
                }
                options.driver.moveNext();
              },
              onPrevClick: (_el, _step, options) => {
                options.driver.moveTo(10);
              },
            },
          },

          // ——— Start time
          {
            element: '[data-tour="form.tasks.start-time"]',
            popover: {
              title: "When to run the task",
              description: `Set the time when the task should become available to the employee.\n
              Tasks are sent <b>right after check-in</b>, when the employee confirms they’re at work.\n
              The time field is a <b>guideline</b>—use it if you want employees to complete the task by a certain hour.`,
              onNextClick: (_el, _step, options) => {
                if (!hasTimeValue('[data-tour="form.tasks.start-time"]')) {
                  showErrorOn(
                    '[data-tour="form.tasks.start-time"]',
                    "Set the start time"
                  );
                  return false;
                }
                options.driver.moveNext();
              },
              onPrevClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.tasks.frequency.header"]';
                const label = (
                  document.querySelector(`${headerSel} span`)?.textContent ||
                  document.querySelector(headerSel)?.textContent ||
                  ""
                ).toLowerCase();

                if (/week/.test(label))
                  return goToStepByElement(
                    options,
                    '[data-tour="form.tasks.weekdays"]'
                  );
                if (/month/.test(label))
                  return goToStepByElement(
                    options,
                    '[data-tour="form.tasks.monthdays"]'
                  );
                if (/(one[\s-]?time|once|single)/.test(label))
                  return goToStepByElement(
                    options,
                    '[data-tour="form.tasks.onetime.calendar"]'
                  );

                // Daily → return to the selectors buffer
                return goToStepByElement(
                  options,
                  '[data-tour="form.tasks.frequency"]'
                );
              },
            },
          },

          // ——— Deadline
          {
            element: '[data-tour="form.tasks.deadline-time"]',
            popover: {
              title: "Deadline",
              description: `Set <b>the latest time</b> the task should be completed.\n
                After this time it’s considered <b>overdue</b>, and the manager will be notified.\n
                <small>This helps keep the team on track.</small>`,
              onNextClick: (_el, _step, options) => {
                if (!hasTimeValue('[data-tour="form.tasks.deadline-time"]')) {
                  showErrorOn(
                    '[data-tour="form.tasks.deadline-time"]',
                    "Set the deadline time"
                  );
                  return false;
                }
                options.driver.moveNext();
              },
            },
          },

          {
            element: '[data-tour="form.tasks.switchers"]',
            popover: {
              title: "Additional settings",
              description: "", // set dynamically
            },
            onHighlighted: (_element, _step, options) => {
              // set description based on the current selection
              setSwitchersStepDesc(options, window.__tourDoneType || "");
              // refresh popover if supported
              options.driver.refresh?.();
            },
          },
          {
            element: '[data-tour="form.tasks.submit"]',
            popover: {
              title: "Save the task",
              description: `Click <b>"Add"</b> to save. The task will appear in the list.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="form.tasks.submit"]'
                );
                btn?.click();
              },
              onPrevClick: (element, _step, options) => {
                options.driver.movePrevious();
                tourEnableSkip();
              },
            },
            onHighlighted: (element, _step, options) => {
              const onBtnClick = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };
              element.removeEventListener("click", onBtnClick);
              element.addEventListener("click", onBtnClick);

              const onSuccess = () => {
                setTimeout(() => {
                  options.driver.moveTo(19);
                }, 150);
              };

              const onFail = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };

              window.addEventListener("tour:tasks:submit:success", onSuccess, {
                once: true,
              });
              window.addEventListener("tour:tasks:submit:fail", onFail, {
                once: true,
              });

              element._tourCleanup = () => {
                element.removeEventListener("click", onBtnClick);
                window.removeEventListener(
                  "tour:tasks:submit:success",
                  onSuccess
                );
                window.removeEventListener("tour:tasks:submit:fail", onFail);
              };

              tourDisableSkip();
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
            },
          },
          {
            popover: {
              title: "Onboarding complete!",
              description: `You’ve finished the core onboarding.\n
                Next we’ll suggest creating employees—you can <b>skip</b> that step if you’d like.\n
                Employees can be added <b>automatically via the Telegram bot</b> <small>(they run the "/start" command)</small>, and then you only need to <b>edit</b> them—set their position and name.`,
              onNextClick: () => {
                drv.destroy();
              },
              nextBtnText: "Finish",
            },
            onHighlighted: () => {
              tourDisableSkip();
            },
            onDeselected: () => {
              tourEnableSkip();
            },
          },
        ],
      };
      drv = driver(config);
      return drv;
    },
  },

  employees: {
    id: "employees",
    route: "/employees",
    readySelectors: ['[data-tour="menu.employees"]'],
    create: (ctx) => {
      let drv; // closure needed so onPopoverRender can call destroy()
      const config = {
        showProgress: true,
        smoothScroll: true,
        allowClose: false,
        popoverClass: "driverjs-theme-dark",
        progressText: "Step {{current}} of {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",

        onDestroyed: () => {
          // completion (normal or via Skip)
          purgeAllTourFlags();
          ctx.complete();
        },

        onPopoverRender: (popover) => {
          handlePopoverRender(drv, popover, "employees");
        },

        steps: [
          {
            element: '[data-tour="menu.employees"]',
            popover: {
              title: `Employees`,
              description: `Here you manage your company’s employees—add new people, assign departments, and configure work schedules.\n
              <div style="
                background-color: rgba(255, 255, 255, 0.08);
                border-left: 3px solid #7cd992;
                padding: 10px 12px;
                border-radius: 6px;
                margin-bottom: 10px;
              ">Tip: <b>Employees can be added automatically</b> via the Telegram bot—after the person runs <b>/start</b> in the bot.<br>
                <small>If needed, you can also add an employee manually from this section.</small>
              </div>
               ${
                 isMobile()
                   ? ""
                   : `Click <b>“Employees”</b> in the left menu to open this section.`
               }`,
              nextBtnText: "Create one",
              onNextClick: (element, step, options) => {
                options.driver.moveTo(1);
              },
            },
            onHighlighted: (element, step, options) => {
              element?.addEventListener("click", () => {
                options.driver.moveTo(1);
              });
            },
          },
          {
            element: '[data-tour="employees.add"]',
            popover: {
              title: "Create a new employee",
              description: `Click <b>“Add”</b> to open the employee form.\n
                You can enter basic details, select a department, and set a work schedule.`,
              onNextClick: (element, _, options) => {
                element?.click();
                options.driver.moveTo(2);
              },
            },
            onHighlighted: (element, _, options) => {
              element?.addEventListener("click", () => {
                setTimeout(() => {
                  options.driver.moveTo(2);
                }, 100);
              });
            },
          },
          {
            element: '[data-tour="form.employee.name"]',
            popover: {
              title: "Employee full name",
              description: `Enter the employee’s full name.\n
                This will be shown in lists and tasks so you can easily tell people apart.`,
              onNextClick: (element, step, options) => {
                const input = element.querySelector("input");
                const value = input?.value?.trim() || "";

                // Split by spaces and remove empties
                const words = value.split(/\s+/).filter(Boolean);

                // Require at least 2 words
                if (words.length < 2) {
                  input.classList.add("input-error");
                  input.focus();

                  import("sonner").then(({ toast }) => {
                    toast.error(
                      "Enter at least first and last name to continue"
                    );
                  });

                  return false;
                }

                options.driver.moveNext();
              },
            },
            onHighlighted: (element) => {
              const input = element.querySelector("input");
              if (input) input.classList.remove("input-error");
            },
          },
          {
            element: '[data-tour="form.employee.role"]',
            popover: {
              title: "Choose a role",
              description: `Select the employee’s role.\n
                Click the field to open the role list—<b>“Employee”</b> or <b>“Manager”</b>.\n
                If you choose <b>“Manager”</b>, you can assign multiple departments.`,
              nextBtnText: "Show options",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.role.menu", 4)
                );
                element
                  .querySelector('[data-tour="form.employee.role.header"]')
                  ?.click();
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.employee.role.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.employee.role.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.role.menu", 4)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },

            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.employee.role.menu"]',
            popover: {
              title: "Role options",
              description: `<ul>
              <li><b>Employee</b> — receives tasks and checks in/out</li>
              <li><b>Manager</b> — has access to reports</li>
              </ul>
              Select a role to continue.`,
            },
            onHighlighted: (element, step, options) => {
              const header = document.querySelector(
                '[data-tour="form.employee.role.header"]'
              );
              const isMenuOpen = !!document.querySelector(
                '[data-tour="form.employee.role.menu"]'
              );
              if (!isMenuOpen && header) header.click();

              element?.addEventListener("click", () => {
                options.driver.moveNext();
              });
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.employee.role.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.employee.role.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.employee.dep"]',
            popover: {
              title: "Assign a department",
              description: `By default, the <b>default</b> department is selected.\n
                If the employee works at another location, choose a different one.\n
                Click the field to open the department list.`,
              nextBtnText: "Show options",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.dep.menu", 6)
                );
                element
                  .querySelector('[data-tour="form.employee.dep.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(3);
              },
            },

            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.employee.dep.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.employee.dep.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.dep.menu", 6)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },

            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.employee.dep.menu"]',
            popover: {
              title: "Select a department",
              description: `Choose the department where the employee works.\n
                For managers you can select multiple departments.\n
                If the employee works in the main location, keep the default value.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.employee.dep.header"]';
                const menuSel = '[data-tour="form.employee.dep.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /select\s+department/i,
                  "Please select a department"
                );
                if (!ok) return false; // stop if nothing selected

                closeDropdownAndGo(headerSel, menuSel, options); // close + advance
                return false; // prevent default Next from firing twice
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.employee.dep.header"]';
              const menuSel = '[data-tour="form.employee.dep.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                // let the UI render selected tags
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /select\s+department/i,
                    ""
                  );
                  if (ok) {
                    closeDropdownAndGo(headerSel, menuSel, options);
                  }
                }, 10);
              };

              // remove previous handler if any
              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);

              // no need to auto-open: menu is already open on this step
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              // close menu if open
              const header = document.querySelector(
                '[data-tour="form.employee.dep.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.employee.dep.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.employee.position"]',
            popover: {
              title: "Choose positions",
              description: `Select one or more positions the employee holds.`,
              nextBtnText: "Show options",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.position.menu", 8)
                );
                element
                  .querySelector('[data-tour="form.employee.position.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(5);
              },
            },

            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.employee.position.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.employee.position.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.position.menu", 8)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },

            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.employee.position.menu"]',
            popover: {
              title: "Select positions",
              description: `You can <b>create a new</b> position if it’s <b>not in the list</b>—start typing and click <b>"Create"</b>.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.employee.position.header"]';
                const menuSel = '[data-tour="form.employee.position.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /select\s+position/i,
                  "Please select a position",
                  { isMulti: true } // optional: auto-detected
                );
                if (!ok) return false; // stop if nothing selected

                closeDropdownAndGo(headerSel, menuSel, options); // close + advance
                return false; // prevent default Next from firing twice
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.employee.position.header"]';
              const menuSel = '[data-tour="form.employee.position.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const advanceToFrequency = () => {
                if (element._tourAdvancing) return; // guard against double-advance
                element._tourAdvancing = true;
                // close the menu and go to the next needed step (not just moveNext)
                closeDropdownAndGo(headerSel, menuSel, options, {
                  afterClose: () => {
                    options.driver.refresh?.();
                    goToStepByElement(
                      options,
                      '[data-tour="form.tasks.frequency"]'
                    );
                    element._tourAdvancing = false;
                  },
                });
              };

              const onCreated = () => {
                advanceToFrequency();
              };
              window.addEventListener(
                "tour:employee:position:create:success",
                onCreated,
                { once: true }
              );

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                // let the UI render selected tags
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /select\s+position/i,
                    "",
                    { isMulti: true }
                  );
                  if (ok) {
                    closeDropdownAndGo(headerSel, menuSel, options);
                  }
                }, 10);
              };

              // remove previous handler if any
              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () => {
                element.removeEventListener("click", onPick);
                window.removeEventListener(
                  "tour:task:position:create:success",
                  onCreated
                );
                element._tourAdvancing = false;
              };

              // no need to auto-open: menu is already open on this step
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              // close menu if open
              const header = document.querySelector(
                '[data-tour="form.employee.position.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.employee.position.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.employee.timezone"]',
            popover: {
              title: "Set the time zone",
              description: `By default, the time zone is taken from the department. If the employee lives or works in another region, click the field to choose a different one.`,
              nextBtnText: "Show options",
              onNextClick: (element, step, options) => {
                const header = element.querySelector(
                  '[data-tour="form.employee.timezone.header"]'
                );
                if (header) header.click();

                const waitForMenu = () => {
                  const menu = document.querySelector(
                    '[data-tour="form.employee.timezone.menu"]'
                  );
                  if (menu) {
                    setTimeout(() => {
                      options.driver.moveTo(10);
                    }, 150);
                  } else {
                    requestAnimationFrame(waitForMenu);
                  }
                };
                waitForMenu();
                return false;
              },
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(7);
              },
            },
            onHighlighted: (element, step, options) => {
              const waitForMenu = () => {
                const menu = document.querySelector(
                  '[data-tour="form.employee.timezone.menu"]'
                );
                if (menu) {
                  setTimeout(() => {
                    options.driver.moveTo(10);
                  }, 150);
                } else {
                  requestAnimationFrame(waitForMenu);
                }
              };
              waitForMenu();
            },
          },
          {
            element: '[data-tour="form.employee.timezone.menu"]',
            popover: {
              title: "Select a time zone",
              description: `Choose the time zone where the employee is located.\n
                This ensures notifications arrive at the correct local time.`,
            },
            onHighlighted: (element, step, options) => {
              const header = document.querySelector(
                '[data-tour="modal.timezone.header"]'
              );
              const isMenuOpen = !!document.querySelector(
                '[data-tour="form.employee.timezone.menu"]'
              );
              if (!isMenuOpen && header) header.click();

              element?.addEventListener("click", () => {
                options.driver.moveNext();
              });
            },
            onDeselected: () => {
              const header = document.querySelector(
                '[data-tour="form.employee.timezone.header"]'
              );
              const isMenuOpen = !!document.querySelector(
                '[data-tour="form.employee.timezone.menu"]'
              );
              if (isMenuOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.employee.check-in-time"]',
            popover: {
              title: "Workday start time",
              description: `By default, the shift start time comes from the department settings.\n
                If the employee has a different schedule, set a custom start time.\n
                This time determines when they receive the start-of-day notification and when they can check in via the Telegram bot.`,
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(9);
              },
            },
          },
          {
            element: '[data-tour="form.employee.check-out-time"]',
            popover: {
              title: "Workday end time",
              description: `By default, the shift end time also comes from the department.\n
              If the employee finishes at a different time, set a custom value.\n
              The system uses this time to send a shift-end reminder and track task completion correctly.`,
            },
          },
          {
            element: '[data-tour="form.employee.telegram-id"]',
            popover: {
              title: "Employee Telegram ID",
              description: `Enter the employee’s Telegram numeric ID.\n
                You can find it like this:
                <ol>
                  <li>Ask the employee to open <b>@userinfobot</b> in Telegram and send any message—the bot will show their ID (usually a number like <code>543219876</code>).</li>
                  <li>Or on desktop: open Telegram Settings → Advanced → enable “Show chat IDs”. Then open the employee’s profile—the ID will appear as <b>PEER ID</b>.</li>
                </ol>`,
              onNextClick: (element, step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Enter a Telegram ID to continue"
                );
              },
            },
          },
          {
            element: '[data-tour="form.employee.telegram-name"]',
            popover: {
              title: "Telegram username",
              description: `Enter the employee’s Telegram <b>username</b> so the bot can send tasks and notifications.\n
                It starts with <code>@</code>, for example <b>@ivan_petrov</b>.\n
                The employee may need to enable it in Telegram settings if it’s hidden.`,
            },
          },
          {
            element: '[data-tour="form.employee.submit"]',
            popover: {
              title: "Save the employee",
              description: `<b>Great!</b>\n
                Click <b>“Create”</b> to add the employee to the system.
                After that they’ll appear in the list and you can assign tasks to them.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="form.employee.submit"]'
                );
                btn?.click();
              },
              onPrevClick: (element, step, options) => {
                options.driver.movePrevious();
                tourEnableSkip();
              },
            },
            onHighlighted: (element, _step, options) => {
              const onBtnClick = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };
              element.removeEventListener("click", onBtnClick);
              element.addEventListener("click", onBtnClick);

              const onSuccess = () => {
                setTimeout(() => {
                  options.driver.moveTo(16);
                }, 150);
              };

              const onFail = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };

              window.addEventListener(
                "tour:employee:submit:success",
                onSuccess,
                {
                  once: true,
                }
              );
              window.addEventListener("tour:employee:submit:fail", onFail, {
                once: true,
              });

              element._tourCleanup = () => {
                element.removeEventListener("click", onBtnClick);
                window.removeEventListener(
                  "tour:employee:submit:success",
                  onSuccess
                );
                window.removeEventListener("tour:employee:submit:fail", onFail);
              };
              tourDisableSkip();
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
              tourEnableSkip();
            },
          },
          {
            popover: {
              title: "Employee created!",
              description: `You’ve successfully added an employee and completed onboarding.`,
              nextBtnText: "Close",
              onNextClick: () => {
                drv.destroy(); // triggers onDestroyed -> purgeAllTourFlags()
              },
            },
            onHighlighted: () => {
              tourDisableSkip();
            },
          },
        ],
      };
      drv = driver(config);
      return drv;
    },
  },
};
