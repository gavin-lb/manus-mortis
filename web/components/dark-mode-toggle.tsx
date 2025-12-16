import { Switch } from "@/components/ui/switch"
import { RootOutletContext } from "@/root"
import { useFetcher, useOutletContext } from "@remix-run/react"
import { Moon, Sun } from "lucide-react"

export default function() {
  const { theme, setTheme } = useOutletContext<RootOutletContext>()
  const fetcher = useFetcher();

  return (
    <div className="flex items-center">
      <Moon size="20" className="mx-1 transition-all" style={{scale: theme == "light" ? "0" : "1"}} />
      <Sun size="20"className="absolute mx-1 transition-all" style={{scale: theme == "light" ? "1" : "0"}} />
      <Switch
        checked={theme === "light"}
        onCheckedChange={(checked) => {
          const newTheme = checked ? "light" : "dark-experimental"
          setTheme(newTheme);
          fetcher.submit(
            { theme: newTheme },
            { method: "post", action: "set-theme" }
          );
        }}
      />
    </div>
  )
}