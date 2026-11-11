using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace MyDigitalExistence.Presentation
{
    public sealed class HomeScreen : MonoBehaviour
    {
        [SerializeField] private ModularCharacter _character;
        [SerializeField] private RectTransform _safeArea;
        [SerializeField] private Button _hairButton;
        [SerializeField] private Button _torsoButton;
        [SerializeField] private Button _heldButton;
        [SerializeField] private Button _reactButton;
        [SerializeField] private Button _backButton;
        [SerializeField] private Text _hairLabel;
        [SerializeField] private Text _torsoLabel;
        [SerializeField] private Text _heldLabel;
        [SerializeField] private Text _feedback;
        private SafeAreaLayout _safeAreaLayout;

        private void Awake()
        {
            _safeAreaLayout = new SafeAreaLayout(_safeArea);
        }

        private void OnEnable()
        {
            _hairButton.onClick.AddListener(ChangeHair);
            _torsoButton.onClick.AddListener(ChangeTorso);
            _heldButton.onClick.AddListener(ChangeHeld);
            _reactButton.onClick.AddListener(React);
            _backButton.onClick.AddListener(ReturnToBootstrap);
        }

        private void Start()
        {
            RefreshLabels();
        }

        private void OnDisable()
        {
            _hairButton.onClick.RemoveListener(ChangeHair);
            _torsoButton.onClick.RemoveListener(ChangeTorso);
            _heldButton.onClick.RemoveListener(ChangeHeld);
            _reactButton.onClick.RemoveListener(React);
            _backButton.onClick.RemoveListener(ReturnToBootstrap);
        }

        private void Update()
        {
            _safeAreaLayout.Refresh();
        }

        private void ChangeHair()
        {
            Change(VisualSlot.Hair, "Cabelo alterado");
        }

        private void ChangeTorso()
        {
            Change(VisualSlot.Torso, "Roupa alterada");
        }

        private void ChangeHeld()
        {
            Change(VisualSlot.HeldMain, "Equipamento alterado");
        }

        private void Change(VisualSlot slot, string message)
        {
            _character.Cycle(slot);
            _feedback.text = message;
            RefreshLabels();
        }

        private void RefreshLabels()
        {
            _hairLabel.text = _character.Selected(VisualSlot.Hair).DisplayName;
            _torsoLabel.text = _character.Selected(VisualSlot.Torso).DisplayName;
            _heldLabel.text = _character.Selected(VisualSlot.HeldMain)?.DisplayName ?? "Mãos livres";
        }

        private void React()
        {
            _character.React();
            _feedback.text = "Seu companheiro reagiu!";
        }

        private static void ReturnToBootstrap()
        {
            SceneManager.LoadScene("Bootstrap");
        }
    }
}
