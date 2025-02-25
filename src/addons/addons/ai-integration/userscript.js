const apiUrl = "http://127.0.0.1:5000";

export default async function ({ addon, console }) {
  //style for popup
  const style = document.createElement('link');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('href', apiUrl + '/main.css');
  document.head.appendChild(style);

  window.AI_INTEGRATION = {
    authToken: addon.settings.get("GeminiAPIKey"),
    apiUrl: apiUrl,
  };
}
