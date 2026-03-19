export function applyTheme(template){

  document.body.classList.remove("valentine-theme","forgiveness-theme","epic-theme","anniversary-theme","birthday-theme");

  if(template === "valentine"){
    document.body.classList.add("valentine-theme");
  }

  if(template === "forgiveness"){
    document.body.classList.add("forgiveness-theme");
  }

  if(template === "epic"){
    document.body.classList.add("epic-theme");
  }

  if(template === "anniversary"){
    document.body.classList.add("anniversary-theme");
  }

  if(template === "birthday"){
    document.body.classList.add("birthday-theme");
  }

}