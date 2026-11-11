using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace MyDigitalExistence.Presentation
{
    public sealed class BootstrapScreen : MonoBehaviour
    {
        [SerializeField] private RectTransform _safeArea;
        [SerializeField] private Text _buildLabel;
        [SerializeField] private Text _inputStatus;
        [SerializeField] private Button _testButton;
        [SerializeField] private Button _homeButton;

        private SafeAreaLayout _safeAreaLayout;
        private int _tapCount;

        private void Awake()
        {
            _safeAreaLayout = new SafeAreaLayout(_safeArea);
        }

        private void OnEnable()
        {
            string buildMode = Application.isEditor ? "Editor" : Debug.isDebugBuild ? "Desenvolvimento" : "Release";
            _buildLabel.text = $"{buildMode}  •  v{Application.version}";
            _testButton.onClick.AddListener(ConfirmInput);
            _homeButton.onClick.AddListener(OpenHome);
            _safeAreaLayout.Refresh();
        }

        private void OnDisable()
        {
            _testButton.onClick.RemoveListener(ConfirmInput);
            _homeButton.onClick.RemoveListener(OpenHome);
        }

        private void Update()
        {
            _safeAreaLayout.Refresh();
        }

        private void ConfirmInput()
        {
            _tapCount++;
            _inputStatus.text = $"Entrada recebida ({_tapCount})";
        }

        private static void OpenHome()
        {
            SceneManager.LoadScene("Home");
        }
    }
}
