# Keyboard Teleprompter — Line-by-Line Script Presenter (jQuery)

A tiny **browser teleprompter** that reveals your script **one line at a time** with the keyboard.  
Perfect for **video intros**, **talking head recordings**, **presentations**, **interviews**, and **public speaking** practice.

**SEO keywords:** browser teleprompter, keyboard teleprompter, line-by-line presenter, jQuery keyboard navigation, web teleprompter, speaker notes viewer, script stepper, next/prev slide text, open source teleprompter

---

## Features
- ⌨️ **Keyboard control:** → next, ← previous, **Home** show all, **End** reset  
- 🧾 **Line-by-line flow:** focus on one sentence at a time  
- 🖥️ **Works offline:** single HTML file (CDN jQuery or local)  
- ♿ **Accessible:** polite updates via `aria-live`  
- ⚙️ **Zero build:** edit an array of lines—done

---

## Demo (quick look)
Drag this HTML to your desktop, double-click to open:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Keyboard Teleprompter</title>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <style>
    body{font:16px/1.5 system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:40px;background:#f7f7fb;color:#111}
    .app{max-width:900px;margin:auto;background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.06);padding:28px}
    .hint{color:#666;margin:-6px 0 18px}
    #line{font-size:28px;font-weight:700;min-height:90px}
    #progress{color:#888;font-size:12px;margin-top:8px}
    .all .line{padding:8px 0;border-bottom:1px dashed #eee}
    .edge{animation: flash .25s ease-in-out 2}
    @keyframes flash {50%{background:#fff3cd}}
  </style>
</head>
<body>
  <div class="app" aria-live="polite" role="status">
    <div class="hint">Keys: ← previous • → next • Home show all • End reset</div>
    <div id="line"></div>
    <div id="progress"></div>
  </div>

  <script>
    $(function () {
      var lines = [
        "Hi, I’m Minhajul Anwar, a full-stack developer from Dhaka.",
        "Over 7+ years, I’ve shipped production web apps across fintech, e-commerce, and govtech.",
        "On Daily Niropekkho, I built a Next.js/TypeScript frontend over REST APIs that helped double publisher revenue.",
        "At ShurjoPay, I engineered reliable payment integrations and webhook processing with retries, queues, and validation.",
        "I build scalable Node.js backends with clean REST design, input validation, rate limiting, Redis caching, and background workers (RabbitMQ/Kafka).",
        "On the data side I’m strongest with PostgreSQL/SQL.",
        "For the frontend, I craft responsive, accessible React/Next.js interfaces and use SSR/ISR and component reuse to keep things fast.",
        "For Daniyal Technologies, I bring deep JavaScript/TypeScript and Next.js experience, and I’m actively upskilling on Nest.js and MongoDB to match your stack.",
        "I value clear communication, solid estimates, tests, and code reviews.",
        "You can see my work at github.com/anwar-gazi.",
        "I’d love to help your team ship fast, reliable features that feel great to use."
      ];

      var i = 0, $box = $("#line"), $prog = $("#progress"), $app = $(".app"), showingAll = false;

      function escapeHTML(s){return s.replace(/[&<>\"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
      function renderSingle(){
        showingAll=false; $app.removeClass("all");
        $box.stop(true,true).fadeOut(80, function(){ $box.html(escapeHTML(lines[i])).fadeIn(120); });
        $prog.text((i+1)+" / "+lines.length);
      }
      function showNext(){ if(showingAll) return; if(i<lines.length-1){ i++; renderSingle(); } else flashEdge(); }
      function showPrev(){ if(showingAll) return; if(i>0){ i--; renderSingle(); } else flashEdge(); }
      function showAll(){
        showingAll=true; $app.addClass("all");
        var html = lines.map((line,idx)=>'<div class="line"><strong>'+(idx+1)+'.</strong> '+escapeHTML(line)+'</div>').join("");
        $box.stop(true,true).fadeOut(80, function(){ $box.html(html).fadeIn(120); });
        $prog.text("ALL ("+lines.length+" lines)");
      }
      function resetToStart(){ i=0; renderSingle(); }
      function flashEdge(){ $app.addClass("edge"); setTimeout(()=>{$app.removeClass("edge")},260); }

      renderSingle();

      $(document).on("keydown", function (e) {
        var tag = e.target.tagName.toLowerCase();
        if(tag==="input"||tag==="textarea"||e.target.isContentEditable) return;
        var key = e.key || e.code || e.which;
        if(key==="ArrowRight"||key===39||key===" "||key==="PageDown"){ e.preventDefault(); showNext(); }
        else if(key==="ArrowLeft"||key===37||key==="Backspace"||key==="PageUp"){ e.preventDefault(); showPrev(); }
        else if(key==="Home"||key===36){ e.preventDefault(); showAll(); }
        else if(key==="End"||key===35){ e.preventDefault(); resetToStart(); }
      });
    });
  </script>
</body>
</html>
