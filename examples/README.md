# Import Templates

This folder contains example templates for importing cards into FigJam Planning Card Creator.

## Available Templates

### YAML Format ([cards.yaml](cards.yaml))

Multiple cards are separated by `---` on its own line.

```yaml
title: Your Card Title
objective: What this card aims to achieve
dependencies:
  - First dependency
  - Second dependency
requirements:
  - First requirement
  - Second requirement
lift: 3
start_date: 2024-01-15
end_date: 2024-01-18

---

title: Minimal Card Example
objective: Only title and objective are required
```

### JSON Format ([cards.json](cards.json))

```json
[
  {
    "title": "Your Card Title",
    "objective": "What this card aims to achieve",
    "dependencies": [
      "First dependency",
      "Second dependency"
    ],
    "requirements": [
      "First requirement",
      "Second requirement"
    ],
    "lift": 3,
    "start_date": "2024-01-15",
    "end_date": "2024-01-18"
  },
  {
    "title": "Minimal Card Example",
    "objective": "Only title and objective are required"
  }
]
```

## How to Use

1. Copy the contents of either template file
2. Open the FigJam Planning Card Creator plugin
3. Go to the **Import Cards** tab
4. Paste your cards
5. Click **Add Cards**

## Field Reference

**Required Fields:**

- `title` - The card title
- `objective` - What this card aims to achieve

**Optional Fields:**

- `dependencies` - List of dependencies
- `requirements` - List of requirements  
- `lift` - Estimated days of effort
- `start_date` - When work begins
- `end_date` - When work completes

## Tips

- You can import multiple cards at once
- Both YAML and JSON formats support the same clean structure
- YAML uses `---` to separate multiple cards
- JSON uses an array `[...]` for multiple cards
- All optional fields can be omitted
- Lists can be single items or arrays in both formats
