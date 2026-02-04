# Step 2: Create Video

Uses: `remotion-best-practices` skill

IMPORTANT: use remotion version 4.0.414, not 4.0.252

1. Create project structure:
   ```
   {project}/
   ├── public/        # Assets
   ├── src/
   │   ├── Root.tsx   # Composition registry
   │   └── Video.tsx  # Main composition
   ├── package.json
   └── remotion.config.ts
   ```

2. Build scenes based on concept
3. Add animations using `spring()` and `interpolate()`
4. Set up transitions between scenes

Output: Working Remotion project.
