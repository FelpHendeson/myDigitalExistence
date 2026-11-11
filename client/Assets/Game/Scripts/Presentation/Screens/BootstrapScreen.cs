using UnityEngine;
using UnityEngine.UI;

namespace MyDigitalExistence.Presentation
{
    public sealed class BootstrapScreen : MonoBehaviour
    {
        [SerializeField] private RectTransform _safeArea;
        [SerializeField] private Text _buildLabel;
        [SerializeField] private Text _inputStatus;
        [SerializeField] private Button _testButton;

        private Rect _lastSafeArea;
        private Vector2Int _lastScreenSize;
        private int _tapCount;

        private void OnEnable()
        {
            string buildMode = Application.isEditor ? "Editor" : Debug.isDebugBuild ? "Desenvolvimento" : "Release";
            _buildLabel.text = $"{buildMode}  •  v{Application.version}";
            _testButton.onClick.AddListener(ConfirmInput);
            UpdateSafeArea();
        }

        private void OnDisable()
        {
            _testButton.onClick.RemoveListener(ConfirmInput);
        }

        private void Update()
        {
            UpdateSafeArea();
        }

        private void UpdateSafeArea()
        {
            var screenSize = new Vector2Int(Screen.width, Screen.height);
            Rect safeArea = Screen.safeArea;
            if (screenSize == _lastScreenSize && safeArea == _lastSafeArea)
            {
                return;
            }

            _lastScreenSize = screenSize;
            _lastSafeArea = safeArea;
            _safeArea.anchorMin = new Vector2(safeArea.xMin / screenSize.x, safeArea.yMin / screenSize.y);
            _safeArea.anchorMax = new Vector2(safeArea.xMax / screenSize.x, safeArea.yMax / screenSize.y);
        }

        private void ConfirmInput()
        {
            _tapCount++;
            _inputStatus.text = $"Entrada recebida ({_tapCount})";
        }
    }
}
