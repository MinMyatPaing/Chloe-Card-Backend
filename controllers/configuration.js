export const getApiKey = async (req, res, next) => {
    try {
      const { key } = req.params;
  
      try {
        const result = await db.executeQuery(
          "SELECT KeyValue FROM Configuration WHERE KeyName = @KeyName",
          { KeyName: key }
        );
  
        if (result.recordset.length === 0) {
          return res.status(404).json({ error: "Key not found" });
        }
  
        res.json({ key, value: result.recordset[0].KeyValue });
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ error: "Database query failed", message: err.message });
      }
    } catch (error) {
      next(error);
    }
  };
  