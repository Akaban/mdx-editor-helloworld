(ns app.main
  (:require
    [helix.core :refer [$ Fragment defnc]]
   [helix.dom :as d]
   [helix.hooks :as hooks]
   ["react-dom/client" :refer [createRoot]]
   ["@mdxeditor/editor" :refer [MDXEditor
                                toolbarPlugin
                                headingsPlugin
                                listsPlugin
                                linkPlugin
                                quotePlugin
                                tablePlugin
                                thematicBreakPlugin
                                markdownShortcutPlugin
                                UndoRedo
                                BoldItalicUnderlineToggles
                                CodeToggle
                                ListsToggle
                                CreateLink
                                Separator]]
   ))

(defnc Root []
  (let [[content set-content] (hooks/use-state "# Welcome to MDX Editor\n\nStart typing markdown...")]
    (d/div
      {:style {:maxWidth "960px" :margin "2rem auto" :padding "1rem"}}
      (d/h1 {:style {:fontSize 24 :marginBottom "1rem"}} "MDX Editor Demo")
      ($ MDXEditor
        {:markdown content
         :onChange (fn [v] (set-content (or v "")))
         :readOnly false
         :className "mdx-editor-demo"
         :plugins
         [
          (toolbarPlugin
            #js{:toolbarContents (fn []
                                   ($ Fragment nil
                                      ($ UndoRedo)
                                      ($ Separator)
                                      ($ BoldItalicUnderlineToggles)
                                      ($ CodeToggle)
                                      ($ Separator)
                                      ($ ListsToggle)
                                      ($ CreateLink)))})
          (headingsPlugin)
          (listsPlugin)
          (linkPlugin)
          (quotePlugin)
          (tablePlugin)
          (thematicBreakPlugin)
          (markdownShortcutPlugin)
          ]})
      (d/p {:style {:fontSize 12 :color "#64748b" :marginTop "0.5rem"}}
           "Type Markdown. This is a minimal Helix setup."))))

(defonce root* (atom nil))

(defn mount! []
  (when-let [el (.getElementById js/document "app")]
    (let [root (or @root*
                   (reset! root* (createRoot el)))]
      (.render root ($ Root)))))

(defn init []
  (mount!))

(defn ^:dev/after-load reload []
  (mount!))
