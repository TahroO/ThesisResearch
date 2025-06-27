# ThesisResearch – Vergleich von Observables und Signalen in Angular

Dieses Repository enthält den Beispielcode und die Prototypen zur Bachelorarbeit

*„Reaktive Architekturen in Angular:
Chancen und Herausforderungen beim Einsatz von Signalen im Vergleich zu Observables im Kontext moderner Webentwicklung“.*

🌐 **Live-Demo der Vergleichskomponenten:**  
➡️ [https://tahroo.github.io/ThesisResearch/](https://tahroo.github.io/ThesisResearch/)

## Inhalt

Das Repository stellt zwei funktional identische Prototypen bereit, die typische Anwendungsfälle reaktiver Architekturen abbilden:

1. **Produktsuch- und Filterkomponente**
  - Implementierung mit Observables (`src/app/observable-version/observable-search.component.ts`)
  - Implementierung mit Signalen (`src/app/signal-version/signal-search.component.ts`)

2. **Formular-Komponente mit Echtzeit-Validierung**
  - Implementierung mit Observables (`src/app/observable-version/observable-form.component.ts`)
  - Implementierung mit Signalen (`src/app/signal-version/signal-form.component.ts`)

Der jeweils zugrunde liegende Datensatz befindet sich in JSON-Dateien im Verzeichnis `src/assets/data/` und wird zur Laufzeit über entsprechende Services eingebunden.

## Zielsetzung

Das Ziel dieses Vergleichs ist es, die Potenziale und Herausforderungen von **Signalen** als neuem Ansatz zur synchronen Statusverwaltung gegenüber der klassischen **Observable-Technologie** zu evaluieren.

Die Evaluation erfolgt anhand der folgenden Metriken:

- **Komplexität und Verständlichkeit**
- **Wartbarkeit und Änderbarkeit**
- **Synchrones vs. asynchrones Verhalten**
- **Performance und Aktualisierungsverhalten**
- **Lernaufwand für Entwickler**
- **Potenzielle Auswirkungen auf Entwicklungszeit und Kosten**

## Rahmen der Nutzerstudie

Im Rahmen der Nutzerstudie werden Angular-Entwickler eingeladen, den Code beider Varianten zu analysieren und auf Basis der genannten Metriken zu bewerten.  
Die Umfrage zielt darauf ab, die Wahrnehmung und Einschätzung von Entwicklern zu den beiden Ansätzen zu erfassen und deren Einfluss auf die Arbeit im Front-End-Entwicklungsprozess kritisch zu beleuchten.

Teilnehmende finden die relevanten Komponenten und Services in den folgenden Verzeichnissen:

- **Observable-Version:**
  - `observable-version/observable-search.component.ts`
  - `observable-version/observable-form.component.ts`

- **Signal-Version:**
  - `signal-version/signal-search.component.ts`
  - `signal-version/signal-form.component.ts`

- **Services und Models:**
  - `service/productService.ts`
  - `service/userService.ts`
  - `model/product.ts`
  - `model/user.ts`

Die Vergleiche und Bewertungen sollen sich ausschließlich auf die **Logik und Struktur** der jeweiligen Implementierung konzentrieren.  
Style- und Design-Elemente sind bewusst minimalistisch gehalten und nicht Gegenstand der Untersuchung.

## Hinweise zur Nutzung

- Die Implementierungen sind für Angular **v19** optimiert.
- Der Datenaustausch erfolgt über simulierte JSON-Dateien (keine persistente Speicherung).
- Zum Starten der Anwendung lokal:
  ```bash
  npm install
  ng serve
Fragen zur Nutzerstudie oder zum Code?
Bitte wende dich direkt an den Autor der Arbeit.
