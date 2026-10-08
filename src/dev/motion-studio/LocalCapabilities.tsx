import { useEffect, useState } from "react";
import { authoringServices } from "./authoringServices";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export function LocalCapabilities() {
  const [available, setAvailable] = useState(true);
  const [install, setInstall] = useState<InstallEvent>();
  const [update, setUpdate] = useState<ServiceWorker>();
  useEffect(() => {
    let active = true;
    const check = () =>
      void authoringServices
        .capabilities()
        .then((capabilities) => {
          if (active)
            setAvailable(capabilities.export && capabilities.tts && capabilities.persistence);
        })
        .catch(() => {
          if (active) setAvailable(false);
        });
    check();
    const timer = setInterval(check, 15000);
    const installer = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    const installed = () => setInstall(undefined);
    window.addEventListener("beforeinstallprompt", installer);
    window.addEventListener("appinstalled", installed);
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker
        .register("/studio-sw.js", { scope: "/motion-studio" })
        .then((reg) => {
          const warmShell = () => {
            const urls = performance
              .getEntriesByType("resource")
              .filter((entry) => {
                const resource = entry as PerformanceResourceTiming;
                return (
                  ["script", "css", "link"].includes(resource.initiatorType) ||
                  /\.(woff2?|css)(\?|$)/.test(resource.name)
                );
              })
              .map((entry) => entry.name);
            const channel = new MessageChannel();
            channel.port1.onmessage = () => {
              document.documentElement.dataset.studioOfflineReady = "true";
              channel.port1.close();
            };
            reg.active?.postMessage({ type: "CACHE_SHELL", urls }, [channel.port2]);
          };
          void navigator.serviceWorker.ready.then(warmShell);
          if (reg.waiting) setUpdate(reg.waiting);
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller)
                setUpdate(worker);
            });
          });
        })
        .catch(() => {});
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("beforeinstallprompt", installer);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  return (
    <>
      {!available && (
        <div className="local-service-warning" role="status">
          <strong>Usługi lokalne są niedostępne</strong>
          <span>
            Generowanie czytania, eksport i zapis wymagają uruchomionego serwera lokalnego. Podgląd
            i edycja pozostają dostępne.
          </span>
        </div>
      )}
      {install && !window.matchMedia("(display-mode: standalone)").matches && (
        <button
          type="button"
          onClick={() => {
            void install
              .prompt()
              .then(() => install.userChoice)
              .then(() => setInstall(undefined));
          }}
        >
          Zainstaluj Motion Studio
        </button>
      )}
      {update && (
        <button
          type="button"
          onClick={() => {
            update.postMessage("ACTIVATE_UPDATE");
            navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), {
              once: true,
            });
          }}
        >
          Aktualizacja gotowa · uruchom ponownie
        </button>
      )}
    </>
  );
}
