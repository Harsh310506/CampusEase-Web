import insightface
print("InsightFace version:", insightface.__version__)
import inspect
print(inspect.signature(insightface.app.FaceAnalysis.__init__))
