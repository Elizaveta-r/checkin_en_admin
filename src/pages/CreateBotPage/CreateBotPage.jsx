import { useState } from "react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import { SliderWithImageAndText } from "../../ui/SliderWithImageAndText/SliderWithImageAndText";
import styles from "./CreateBotPage.module.scss";

import SearchFatherCommand from "../../assets/img/hint_tg_bot/search_father_command.png";
import SearchFatherInterface from "../../assets/img/hint_tg_bot/search_father_interface.png";

import SearchFatherMobile from "../../assets/img/hint_tg_bot/mobile/botfather.PNG";

import CommandCreate from "../../assets/img/hint_tg_bot/command_1.png";
import TokenCommand from "../../assets/img/hint_tg_bot/token_command.png";

import CreateInterface from "../../assets/img/hint_tg_bot/create_interface.png";
import InfoInterface from "../../assets/img/hint_tg_bot/info_interface.png";
import TokenInterface from "../../assets/img/hint_tg_bot/token_interface.png";

import CommandsMobile from "../../assets/img/hint_tg_bot/mobile/command/1.PNG";
import TokenMobile from "../../assets/img/hint_tg_bot/mobile/command/2.PNG";

import CreateInterfaceMobile from "../../assets/img/hint_tg_bot/mobile/interface/1.PNG";
import InfoInterfaceMobile from "../../assets/img/hint_tg_bot/mobile/interface/2.PNG";
import TokenInterfaceMobile from "../../assets/img/hint_tg_bot/mobile/interface/3.PNG";

import { useDispatch, useSelector } from "react-redux";
import { createIntegration } from "../../utils/api/actions/integrations";
import { useNavigate } from "react-router-dom";
import { RingLoader } from "react-spinners";
import { useMediaQuery } from "react-responsive";
import { VideoHelpBlock } from "./VideoHelpBlock";

const stepsCommands = [
  {
    title: (
      <>
        Step 1. Find{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
      </>
    ),
    text: (
      <>
        Open Telegram and find the official bot{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
        . This is the official tool for creating new bots.
      </>
    ),
    image: SearchFatherCommand,
  },
  {
    title: "Step 2. Create a new bot",
    text: "Type /newbot and follow the instructions: enter a name and a unique username that must end with 'bot'.",
    image: CommandCreate,
  },
  {
    title: "Step 3. Get your access token",
    text: "After creation, BotFather will send you an API token. Copy it and paste it into the field below. This token allows your bot to connect to the system.",
    image: TokenCommand,
  },
];

const stepsCommandMobile = [
  {
    title: (
      <>
        Step 1. Find{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
      </>
    ),
    text: (
      <>
        Open Telegram and find the official bot{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather{" "}
        </a>
        . This is the official tool for creating new bots.
      </>
    ),
    image: SearchFatherMobile,
  },
  {
    title: "Step 2. Create a new bot",
    text: "Type /newbot and follow the instructions: enter a name and a unique username that must end with 'bot'.",
    image: CommandsMobile,
  },
  {
    title: "Step 3. Get your access token",
    text: "After creation, BotFather will send you an API token. Copy it and paste it into the field below. This token allows your bot to connect to the system.",
    image: TokenMobile,
  },
];

const stepsInterface = [
  {
    title: (
      <>
        Step 1. Open{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
      </>
    ),
    text: (
      <>
        Open Telegram and find the official bot{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather{" "}
        </a>
        . Tap the <b>“Open”</b> button next to the bot name.
      </>
    ),
    image: SearchFatherInterface,
  },
  {
    title: "Step 2. Create a bot",
    text: (
      <>
        In the list of your bots, click <b>“Create a New Bot”</b>.
      </>
    ),
    image: CreateInterface,
  },
  {
    title: "Step 3. Enter your bot details",
    text: (
      <>
        Enter your bot name (for example, “Company Bot”) and choose a unique
        username that must end with <b>bot</b> — for example,{" "}
        <b>mycompany_bot</b>. Then click <b>“Create Bot”</b>.
      </>
    ),
    image: InfoInterface,
  },
  {
    title: "Step 4. Copy the access token",
    text: (
      <>
        After the bot is created, BotFather will show the settings page. Click
        the <b>“Copy”</b> button next to the token, then paste it into the field
        below.
      </>
    ),
    image: TokenInterface,
  },
];

const stepsInterfaceMobile = [
  {
    title: (
      <>
        Step 1. Open{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
      </>
    ),
    text: (
      <>
        Open Telegram and find the official bot{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather{" "}
        </a>
        . Tap the <b>“Open”</b> button next to the bot name.
      </>
    ),
    image: SearchFatherMobile,
  },
  {
    title: "Step 2. Create a bot",
    text: (
      <>
        In the list of your bots, tap <b>“Create a New Bot”</b>.
      </>
    ),
    image: CreateInterfaceMobile,
  },
  {
    title: "Step 3. Enter your bot details",
    text: (
      <>
        Enter your bot name (for example, “Company Bot”) and choose a unique
        username that must end with <b>bot</b> — for example,{" "}
        <b>mycompany_bot</b>. Then tap <b>“Create Bot”</b>.
      </>
    ),
    image: InfoInterfaceMobile,
  },
  {
    title: "Step 4. Copy the access token",
    text: (
      <>
        After the bot is created, BotFather will show the settings page. Tap the{" "}
        <b>“Copy”</b> button next to the token, then paste it into the field
        below.
      </>
    ),
    image: TokenInterfaceMobile,
  },
];

export default function CreateBotPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const { isIntegrationLoading } = useSelector((state) => state?.integrations);

  const [mode, setMode] = useState("interface");
  const [token, setToken] = useState("");

  const handleCreate = () => {
    let data = {
      title: "",
      description: "",
      use_type: "employee_interface",
      integration_type: "telegram_bot",
      perpetual_token: token,
    };
    dispatch(createIntegration(data)).then((res) => {
      if (res.status === 200) {
        navigate("/integrations");
        sessionStorage.removeItem("success_registration");
        localStorage.removeItem("hasIntegrations");
        sessionStorage.setItem("success_create_bot", true);
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Create a Telegram bot for your business</h1>
          <div className={styles.subtitleWrapper}>
            <p className={styles.subtitle}>
              To start using <b>AI in your business</b>, create your own bot.
              Just follow the steps below — it’s simple.
            </p>
          </div>
        </div>

        <div className={styles.toggleSection}>
          <div className={styles.toggleWrapper}>
            <button
              onClick={() => setMode("interface")}
              className={`${styles.toggleButton} ${
                mode === "interface" ? styles.active : ""
              }`}
            >
              Easy method (via interface)
            </button>
            <button
              onClick={() => setMode("commands")}
              className={`${styles.toggleButton} ${
                mode === "commands" ? styles.active : ""
              }`}
            >
              Manual method (via commands)
            </button>
          </div>

          <div className={styles.banners}>
            <div className={styles.toggleDescriptions}>
              {mode === "commands" && (
                <p
                  className={`${styles.toggleText} ${
                    mode === "commands" ? styles.activeText : ""
                  }`}
                >
                  💬 Best for users who have worked with BotFather before and
                  know how to configure a bot manually using commands.
                </p>
              )}
              {mode === "interface" && (
                <p
                  className={`${styles.toggleText} ${
                    mode === "interface" ? styles.activeText : ""
                  }`}
                >
                  🧭 A simpler option with buttons and forms — no commands or
                  manual setup required.
                </p>
              )}
            </div>
            {mode === "interface" && (
              <p className={styles.warning}>
                ⚠️ The interface may be unavailable in older Telegram versions.
                In that case, use the manual method.
              </p>
            )}
          </div>
        </div>

        <SliderWithImageAndText
          mode={mode}
          steps={
            mode === "commands"
              ? isMobile
                ? stepsCommandMobile
                : stepsCommands
              : isMobile
                ? stepsInterfaceMobile
                : stepsInterface
          }
        />

        <VideoHelpBlock />

        <form className={styles.form} id="input-token">
          <label>Bot token:</label>
          <CustomInput
            type="text"
            placeholder="Enter the BotFather token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <button
            type="submit"
            className={styles.button}
            onClick={handleCreate}
            disabled={isIntegrationLoading}
          >
            {isIntegrationLoading && <RingLoader size={18} color="#fff" />}
            {isIntegrationLoading ? "Creating..." : "Create bot"}
          </button>
        </form>
      </div>
    </div>
  );
}
