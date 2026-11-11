using System.Collections;
using MyDigitalExistence.Presentation;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;

namespace MyDigitalExistence.Tests
{
    public sealed class HomeFlowTests
    {
        private float _previousTimeScale;

        [SetUp]
        public void PauseAutomaticAnimation()
        {
            _previousTimeScale = Time.timeScale;
            Time.timeScale = 0;
        }

        [TearDown]
        public void RestoreTimeScale()
        {
            Time.timeScale = _previousTimeScale;
        }

        [UnityTest]
        public IEnumerator HomeChangesPartsOnTheCurrentFrameAndReacts()
        {
            yield return SceneManager.LoadSceneAsync("Bootstrap");
            yield return null;
            Click("Open Home");
            yield return null;
            yield return null;
            Assert.That(SceneManager.GetActiveScene().name, Is.EqualTo("Home"));

            var character = Object.FindFirstObjectByType<ModularCharacter>();
            Assert.That(character, Is.Not.Null);
            character.enabled = false;
            character.Advance(0.25f);
            int originalFrame = character.FrameIndex;
            Assert.That(originalFrame, Is.InRange(1, 3));

            var bodyRenderer = Renderer(character, VisualSlot.Body);
            var hairRenderer = Renderer(character, VisualSlot.Hair);
            var torsoRenderer = Renderer(character, VisualSlot.Torso);
            var handRenderer = Renderer(character, VisualSlot.HeldMain);
            Sprite originalBody = bodyRenderer.sprite;
            Click("Hair Option");
            Click("Torso Option");
            Click("Held Option");

            Assert.That(character.FrameIndex, Is.EqualTo(originalFrame));
            Assert.That(bodyRenderer.sprite, Is.SameAs(originalBody));
            Assert.That(character.Selected(VisualSlot.Hair).Id, Is.EqualTo("hair_wild_layers"));
            Assert.That(character.Selected(VisualSlot.Torso).Id, Is.EqualTo("torso_novice_robe"));
            Assert.That(character.Selected(VisualSlot.HeldMain).Id, Is.EqualTo("wpn_woven_staff"));
            AssertFrame(character, VisualSlot.Hair, hairRenderer);
            AssertFrame(character, VisualSlot.Torso, torsoRenderer);
            AssertFrame(character, VisualSlot.HeldMain, handRenderer);
            Assert.That(handRenderer.sortingOrder, Is.GreaterThan(hairRenderer.sortingOrder));
            Assert.That(hairRenderer.sortingOrder, Is.GreaterThan(torsoRenderer.sortingOrder));

            Assert.That(character.TrySelect(VisualSlot.Hair, "torso_linen_tunic"), Is.False);
            Assert.That(character.TrySelect(VisualSlot.Hair, "missing_id"), Is.False);
            AssertFrame(character, VisualSlot.Hair, hairRenderer);

            Click("Held Option");
            Assert.That(handRenderer.sprite, Is.Null);
            Click("Held Option");
            AssertFrame(character, VisualSlot.HeldMain, handRenderer);

            Click("React");
            Assert.That(character.IsReacting, Is.True);
            Assert.That(character.FrameIndex, Is.EqualTo(4));
            character.Advance(0.15f);
            Assert.That(character.FrameIndex, Is.EqualTo(5));
            AssertFrame(character, VisualSlot.Body, bodyRenderer);
            AssertFrame(character, VisualSlot.Hair, hairRenderer);
            AssertFrame(character, VisualSlot.Torso, torsoRenderer);
            AssertFrame(character, VisualSlot.HeldMain, handRenderer);
            character.Advance(0.22f);
            Assert.That(character.IsReacting, Is.False);
            Assert.That(character.FrameIndex, Is.EqualTo(originalFrame));

            Click("Return");
            yield return null;
            yield return null;
            Assert.That(SceneManager.GetActiveScene().name, Is.EqualTo("Bootstrap"));
        }

        private static SpriteRenderer Renderer(ModularCharacter character, VisualSlot slot)
        {
            return character.transform.Find(slot.ToString()).GetComponent<SpriteRenderer>();
        }

        private static void AssertFrame(ModularCharacter character, VisualSlot slot, SpriteRenderer renderer)
        {
            var frame = character.Selected(slot).Frames[character.FrameIndex];
            Assert.That(renderer.sprite, Is.SameAs(frame.Sprite));
            Assert.That(renderer.sortingOrder, Is.EqualTo(frame.Order));
            Assert.That(renderer.transform.localPosition, Is.EqualTo(Vector3.zero));
        }

        private static void Click(string name)
        {
            var button = GameObject.Find(name)?.GetComponent<Button>();
            Assert.That(button, Is.Not.Null, name);
            button.onClick.Invoke();
        }
    }
}
