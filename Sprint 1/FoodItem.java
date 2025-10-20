// Simple class for Food Items
// Currently missing error checking
public class FoodItem {
    private String name;
    private int calories;

    public FoodItem(String name, int calories) {
        this.name = name;
        this.calories = calories;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public String getName() {
        return name;
    }

    public int getCalories() {
        return calories;
    }
}
