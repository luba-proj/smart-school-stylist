from app.schemas.child_profile import ChildProfile

CHILD_PROFILES = {
    "emma": ChildProfile(
        name="Emma",
        age=11,
        preferences="casual comfortable outfits",
        favorite_colors=["blue", "purple"],
        dislikes=["dresses for regular school"],
    ),
    "mia": ChildProfile(
        name="Mia",
        age=7,
        preferences="soft comfortable clothes",
        favorite_colors=["pink", "purple"],
        dislikes=[],
    ),
}
